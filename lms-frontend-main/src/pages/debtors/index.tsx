import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DebtorBucket,
  IDebtor,
  useGetDebtorsQuery,
  useRemindDebtorsMutation,
} from "@/app/store/services/debtors.service";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/loading-button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { NoItems } from "@/components/no-items/no-items";
import { formatAmount, formatPhoneNumber } from "@/lib/utils";

const BUCKETS: { value: DebtorBucket | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "0-29", label: "0–29 дней" },
  { value: "30-59", label: "30–59 дней" },
  { value: "60-89", label: "60–89 дней" },
  { value: "90+", label: "90+ дней" },
];

export const DebtorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bucket, setBucket] = useState<DebtorBucket | "all">("all");
  const { data, isLoading } = useGetDebtorsQuery(
    bucket === "all" ? {} : { bucket: bucket as DebtorBucket },
  );
  const [remind, remindState] = useRemindDebtorsMutation();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const rows = useMemo<IDebtor[]>(() => data ?? [], [data]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  };

  const sendToSelected = async () => {
    const studentIds = Array.from(selected);
    if (!studentIds.length) return;
    const res = await remind({ studentIds }).unwrap();
    toast({
      title: "SMS в очереди",
      description: `Поставлено заданий: ${res.enqueued}`,
    });
    setSelected(new Set());
  };

  const sendToAllInBucket = async () => {
    const res = await remind(
      bucket === "all" ? {} : { bucket: bucket as DebtorBucket },
    ).unwrap();
    toast({
      title: "SMS в очереди",
      description: `Поставлено заданий: ${res.enqueued}`,
    });
  };

  return (
    <section>
      <div className="flex flex-wrap gap-2 items-center justify-between mb-6 mt-4">
        <h3 className="font-bold text-xl">Должники</h3>
        <div className="flex gap-2 items-center">
          <Select
            value={bucket}
            onValueChange={(v) => setBucket(v as DebtorBucket | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр" />
            </SelectTrigger>
            <SelectContent>
              {BUCKETS.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={selectAll}>
            {selected.size === rows.length && rows.length > 0
              ? "Снять выделение"
              : "Выбрать всех"}
          </Button>
          <ButtonLoading
            size="sm"
            variant="outline"
            isLoading={remindState.isLoading}
            onClick={sendToAllInBucket}
          >
            SMS всем в фильтре
          </ButtonLoading>
          <ButtonLoading
            size="sm"
            isLoading={remindState.isLoading}
            onClick={sendToSelected}
            disabled={selected.size === 0}
          >
            SMS выбранным ({selected.size})
          </ButtonLoading>
        </div>
      </div>

      {isLoading ? (
        <div>loading…</div>
      ) : rows.length > 0 ? (
        <div className="border rounded-lg w-full">
          <div className="relative w-full overflow-auto">
            <Table className="text-[13px] md:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[24px]">
                    <Checkbox
                      checked={
                        selected.size > 0 && selected.size === rows.length
                      }
                      onCheckedChange={selectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[18px] md:w-[32px]">№</TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Отец</TableHead>
                  <TableHead>Мать</TableHead>
                  <TableHead>Баланс</TableHead>
                  <TableHead>Дней</TableHead>
                  <TableHead>Сегмент</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d, i) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(d.id)}
                        onCheckedChange={() => toggle(d.id)}
                      />
                    </TableCell>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/students/${d.id}`}>{d.fio}</Link>
                    </TableCell>
                    <TableCell>{formatPhoneNumber(d.phone)}</TableCell>
                    <TableCell>
                      {d.fatherPhone ? formatPhoneNumber(d.fatherPhone) : "—"}
                    </TableCell>
                    <TableCell>
                      {d.montherPhone ? formatPhoneNumber(d.montherPhone) : "—"}
                    </TableCell>
                    <TableCell className="text-right px-4 text-red-600">
                      {formatAmount(Math.floor(d.balance / 1000) * 1000)}
                    </TableCell>
                    <TableCell>{d.overdueDays ?? "—"}</TableCell>
                    <TableCell>{d.bucket}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-4 mt-4 w-full p-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => navigate("/accounting")}
              className="w-1/2"
            >
              Назад
            </Button>
          </div>
        </div>
      ) : (
        <NoItems head="Нет должников" />
      )}
    </section>
  );
};

export default DebtorsPage;
