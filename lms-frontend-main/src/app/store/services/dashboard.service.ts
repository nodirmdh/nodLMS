import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export type DashboardPeriod = "week" | "month" | "year";

export interface IDashboardSummary {
  period: DashboardPeriod;
  from: string;
  income: number;
  expense: number;
  profit: number;
  totalLeeds: number;
  newLeedsInPeriod: number;
  activeStudents: number;
}

export interface IBranchMetric {
  branchId: number;
  branchName: string;
  income: number;
  expense: number;
  profit: number;
  activeStudents: number;
  newStudentsInPeriod: number;
  debtors: number;
}

export interface IBranchesResponse {
  period: DashboardPeriod;
  from: string;
  branches: IBranchMetric[];
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getSummary: builder.query<IDashboardSummary, DashboardPeriod | void>({
      query(period) {
        return { url: `/dashboard/summary?period=${period || "month"}` };
      },
    }),
    getBranches: builder.query<IBranchesResponse, DashboardPeriod | void>({
      query(period) {
        return { url: `/dashboard/branches?period=${period || "month"}` };
      },
    }),
  }),
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: false,
});

export const { useGetSummaryQuery, useGetBranchesQuery } = dashboardApi;
