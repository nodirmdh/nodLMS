import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ButtonLoading } from "@/components/ui/loading-button";
import { Download } from "lucide-react";
import {
  downloadReport,
  ReportKind,
  useEnqueueReportMutation,
  useGetReportStatusQuery,
} from "@/app/store/services/reports.service";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";

interface Props {
  kind: ReportKind;
  from?: string;
  to?: string;
  branchId?: number;
  children?: React.ReactNode;
}

/**
 * Универсальная кнопка «Скачать Excel».
 *
 * Как работает:
 *   1. POST /admin/reports → получает jobId.
 *   2. Поллит /admin/reports/:jobId/status раз в 2 секунды.
 *   3. Когда state=completed — делает download через fetch + blob + click.
 *
 * При ошибке показывает toast.
 */
export function ExportExcelButton({
  kind,
  from,
  to,
  branchId,
  children,
}: Props) {
  const { toast } = useToast();
  const token = useSelector((s: RootState) => s.authState.token);
  const [enqueue] = useEnqueueReportMutation();
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const downloadedRef = useRef<string | null>(null);

  const { data: status } = useGetReportStatusQuery(jobId ?? "", {
    skip: !jobId,
    pollingInterval: 2000,
  });

  useEffect(() => {
    if (!jobId || !status) return;
    if (downloadedRef.current === jobId) return;

    if (status.state === "completed") {
      downloadedRef.current = jobId;
      downloadReport(jobId, token)
        .then(() => {
          toast({ title: "Готово" });
        })
        .catch((err) => {
          toast({
            title: "Ошибка скачивания",
            description: err?.message ?? "Попробуйте ещё раз",
          });
        })
        .finally(() => {
          setLoading(false);
          setJobId(null);
        });
    } else if (status.state === "failed") {
      toast({
        title: "Не удалось сгенерировать отчёт",
        description: status.failedReason ?? "Неизвестная ошибка",
      });
      setLoading(false);
      setJobId(null);
    }
  }, [status, jobId, token, toast]);

  const onClick = async () => {
    try {
      setLoading(true);
      const { jobId: id } = await enqueue({
        kind,
        from,
        to,
        branchId,
      }).unwrap();
      setJobId(id);
    } catch (err) {
      setLoading(false);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as Error)?.message ??
        "Не удалось запустить отчёт";
      toast({ title: "Ошибка", description: String(msg) });
    }
  };

  return (
    <ButtonLoading
      size="sm"
      variant="outline"
      onClick={onClick}
      isLoading={loading}
    >
      <Download className="h-4 w-4 mr-1" />
      {children ?? "Excel"}
    </ButtonLoading>
  );
}
