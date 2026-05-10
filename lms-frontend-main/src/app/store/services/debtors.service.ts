import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export type DebtorBucket = "0-29" | "30-59" | "60-89" | "90+";

export interface IDebtor {
  id: number;
  fio: string;
  phone: string;
  fatherPhone: string | null;
  montherPhone: string | null;
  balance: number;
  overdueDays: number | null;
  bucket: DebtorBucket;
}

export const debtorsApi = createApi({
  reducerPath: "debtorsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["DEBTORS_LIST"],
  endpoints: (builder) => ({
    getDebtors: builder.query<
      IDebtor[],
      { bucket?: DebtorBucket; minDebt?: number }
    >({
      query(params) {
        const qs = new URLSearchParams();
        if (params.bucket) qs.set("bucket", params.bucket);
        if (params.minDebt) qs.set("minDebt", String(params.minDebt));
        const s = qs.toString();
        return { url: `/debtors${s ? `?${s}` : ""}` };
      },
      providesTags: ["DEBTORS_LIST"],
    }),
    remindDebtors: builder.mutation<
      { enqueued: number; skipped: number },
      { studentIds?: number[]; bucket?: DebtorBucket }
    >({
      query(body) {
        return { url: "/debtors/remind", method: "POST", body };
      },
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const { useGetDebtorsQuery, useRemindDebtorsMutation } = debtorsApi;
