import React, { useState } from "react";
import { format } from "date-fns";
import {
  IPaymentPlan,
  useCancelPlanMutation,
  useCreatePlanMutation,
  useGetPlansQuery,
  useUpdateItemMutation,
} from "@/app/store/services/payment-plans.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatAmount } from "@/lib/utils";

export const PaymentPlansPage: React.FC = () => {
  const { data: plans, isLoading } = useGetPlansQuery({});
  const [createPlan, createState] = useCreatePlanMutation();
  const [updateItem] = useUpdateItemMutation();
  const [cancelPlan] = useCancelPlanMutation();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    totalAmount: "",
    monthsCount: "3",
    startDate: format(new Date(), "yyyy-MM-dd"),
    comment: "",
  });

  const onCreate = async () => {
    if (!form.studentId || !form.totalAmount) return;
    await createPlan({
      studentId: Number(form.studentId),
      totalAmount: Number(form.totalAmount),
      monthsCount: Number(form.monthsCount),
      startDate: new Date(form.startDate).toISOString(),
      comment: form.comment || undefined,
    }).unwrap();
    setOpen(false);
    setForm({
      studentId: "",
      totalAmount: "",
      monthsCount: "3",
      startDate: format(new Date(), "yyyy-MM-dd"),
      comment: "",
    });
    toast({ title: "План создан" });
  };

  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Рассрочка</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Создать план</Button>
          </DialogTrigger>
          <DialogContent className="w-[min(100%-20px,500px)]">
            <DialogHeader>
              <DialogTitle>Новый план рассрочки</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <label className="text-sm">
                ID студента
                <Input
                  value={form.studentId}
                  onChange={(e) =>
                    setForm({ ...form, studentId: e.target.value })
                  }
                />
              </label>
              <label className="text-sm">
                Сумма (сум)
                <Input
                  type="number"
                  value={form.totalAmount}
                  onChange={(e) =>
                    setForm({ ...form, totalAmount: e.target.value })
                  }
                />
              </label>
              <label className="text-sm">
                Количество месяцев
                <Input
                  type="number"
                  value={form.monthsCount}
                  min={1}
                  max={36}
                  onChange={(e) =>
                    setForm({ ...form, monthsCount: e.target.value })
                  }
                />
              </label>
              <label className="text-sm">
                Дата первого платежа
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </label>
              <label className="text-sm">
                Комментарий
                <Input
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                />
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={onCreate}
                disabled={createState.isLoading}
              >
                Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>loading…</div>
      ) : !plans?.length ? (
        <p className="text-muted-foreground text-sm">Планов нет.</p>
      ) : (
        plans.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                План #{p.id} · Студент #{p.studentId}
              </CardTitle>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  {formatAmount(p.totalAmount)} / {p.monthsCount} мес · {p.status}
                </span>
                {p.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelPlan(p.id)}
                  >
                    Отменить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PlanItems plan={p} onToggle={updateItem} />
            </CardContent>
          </Card>
        ))
      )}
    </section>
  );
};

const PlanItems: React.FC<{
  plan: IPaymentPlan;
  onToggle: ReturnType<typeof useUpdateItemMutation>[0];
}> = ({ plan, onToggle }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1 px-2">Дата</th>
            <th className="text-right py-1 px-2">Сумма</th>
            <th className="text-right py-1 px-2">Оплачено</th>
            <th className="text-left py-1 px-2">Статус</th>
            <th className="py-1 px-2"></th>
          </tr>
        </thead>
        <tbody>
          {plan.items.map((it) => (
            <tr key={it.id} className="border-b last:border-0">
              <td className="py-1 px-2">
                {format(new Date(it.dueDate), "dd.MM.yyyy")}
              </td>
              <td className="py-1 px-2 text-right">
                {formatAmount(it.amount)}
              </td>
              <td className="py-1 px-2 text-right">
                {formatAmount(it.paidAmount)}
              </td>
              <td className="py-1 px-2">{it.status}</td>
              <td className="py-1 px-2">
                {it.status !== "paid" && it.status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onToggle({
                        itemId: it.id,
                        data: {
                          paidAmount: it.amount,
                          status: "paid",
                        },
                      })
                    }
                  >
                    Отметить оплату
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentPlansPage;
