import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export type ReportKind =
  | "transactions.excel"
  | "students.excel"
  | "debtors.excel";

export interface IReportStatus {
  jobId: string;
  state: string;
  attemptsMade: number;
  failedReason: string | null;
  finishedOn: number | null;
  returnvalue: unknown;
}

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    enqueueReport: builder.mutation<
      { jobId: string },
      { kind: ReportKind; from?: string; to?: string; branchId?: number }
    >({
      query(body) {
        return { url: "/admin/reports", method: "POST", body };
      },
    }),
    getReportStatus: builder.query<IReportStatus, string>({
      query(jobId) {
        return { url: `/admin/reports/${jobId}/status` };
      },
    }),
  }),
});

export const { useEnqueueReportMutation, useGetReportStatusQuery } = reportsApi;

/**
 * Helper: скачать готовый отчёт.
 * fetch с Bearer'ом -> blob -> `a.click()`.
 */
export async function downloadReport(jobId: string, token: string | null) {
  const url = `${import.meta.env.VITE_API_URL}/admin/reports/${jobId}/download`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const blob = await res.blob();
  const a = document.createElement("a");
  const href = URL.createObjectURL(blob);
  a.href = href;
  a.download =
    res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ||
    `report-${jobId}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
