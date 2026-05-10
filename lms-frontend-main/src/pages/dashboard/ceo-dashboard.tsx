import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardPeriod,
  useGetBranchesQuery,
  useGetSummaryQuery,
} from "@/app/store/services/dashboard.service";
import { formatAmount } from "@/lib/utils";

export const CeoDashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery(
    period,
  );
  const { data: byBranch, isLoading: branchesLoading } =
    useGetBranchesQuery(period);

  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Сводка</h2>
        <Select
          value={period}
          onValueChange={(v) => setPeriod(v as DashboardPeriod)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
            <SelectItem value="year">Год</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label="Доход"
          value={summary?.income ?? 0}
          loading={summaryLoading}
        />
        <Kpi
          label="Расход"
          value={summary?.expense ?? 0}
          loading={summaryLoading}
        />
        <Kpi
          label="Прибыль"
          value={summary?.profit ?? 0}
          loading={summaryLoading}
          tone={summary && summary.profit < 0 ? "bad" : "good"}
        />
        <Kpi
          label="Активных студентов"
          value={summary?.activeStudents ?? 0}
          loading={summaryLoading}
          kind="count"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">По филиалам</CardTitle>
        </CardHeader>
        <CardContent>
          {branchesLoading ? (
            <div>loading…</div>
          ) : !byBranch?.branches?.length ? (
            <div className="text-sm text-muted-foreground">Данных нет.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Филиал</th>
                    <th className="text-right py-2 px-2">Доход</th>
                    <th className="text-right py-2 px-2">Расход</th>
                    <th className="text-right py-2 px-2">Прибыль</th>
                    <th className="text-right py-2 px-2">Активных</th>
                    <th className="text-right py-2 px-2">Новых</th>
                    <th className="text-right py-2 px-2">Должников</th>
                  </tr>
                </thead>
                <tbody>
                  {byBranch.branches.map((b) => (
                    <tr key={b.branchId} className="border-b last:border-0">
                      <td className="py-2 px-2 font-medium">{b.branchName}</td>
                      <td className="py-2 px-2 text-right text-green-700">
                        {formatAmount(b.income)}
                      </td>
                      <td className="py-2 px-2 text-right text-red-700">
                        {formatAmount(b.expense)}
                      </td>
                      <td
                        className={`py-2 px-2 text-right font-medium ${
                          b.profit < 0 ? "text-red-700" : "text-green-700"
                        }`}
                      >
                        {formatAmount(b.profit)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {b.activeStudents}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {b.newStudentsInPeriod}
                      </td>
                      <td className="py-2 px-2 text-right">{b.debtors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

interface KpiProps {
  label: string;
  value: number;
  loading?: boolean;
  kind?: "money" | "count";
  tone?: "good" | "bad" | "neutral";
}

const Kpi: React.FC<KpiProps> = ({
  label,
  value,
  loading,
  kind = "money",
  tone = "neutral",
}) => {
  const toneCls =
    tone === "good"
      ? "text-green-700"
      : tone === "bad"
      ? "text-red-700"
      : "";
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${toneCls}`}>
          {loading
            ? "…"
            : kind === "money"
            ? formatAmount(value)
            : value.toLocaleString("ru-RU")}
        </div>
      </CardContent>
    </Card>
  );
};

export default CeoDashboardPage;
