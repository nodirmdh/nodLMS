import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export type PaymentPlanStatus = "active" | "completed" | "cancelled";
export type PaymentPlanItemStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled";

export interface IPaymentPlanItem {
  id: number;
  planId: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: PaymentPlanItemStatus;
  paidTransactionId: number | null;
  createdAt: string;
}

export interface IPaymentPlan {
  id: number;
  studentId: number;
  totalAmount: number;
  monthsCount: number;
  startDate: string;
  status: PaymentPlanStatus;
  comment: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  items: IPaymentPlanItem[];
}

export interface ICreatePaymentPlanDto {
  studentId: number;
  totalAmount: number;
  monthsCount: number;
  startDate: string;
  comment?: string;
}

export const paymentPlansApi = createApi({
  reducerPath: "paymentPlansApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["PP_LIST", "PP_ONE"],
  endpoints: (builder) => ({
    getPlans: builder.query<
      IPaymentPlan[],
      { studentId?: number; status?: PaymentPlanStatus }
    >({
      query({ studentId, status }) {
        const qs = new URLSearchParams();
        if (studentId != null) qs.set("studentId", String(studentId));
        if (status) qs.set("status", status);
        const s = qs.toString();
        return { url: `/payment-plans${s ? `?${s}` : ""}` };
      },
      providesTags: ["PP_LIST"],
    }),
    getPlan: builder.query<IPaymentPlan, number>({
      query(id) {
        return { url: `/payment-plans/${id}` };
      },
      providesTags: (_r, _e, id) => [{ type: "PP_ONE", id }],
    }),
    createPlan: builder.mutation<IPaymentPlan, ICreatePaymentPlanDto>({
      query(body) {
        return { url: "/payment-plans", method: "POST", body };
      },
      invalidatesTags: ["PP_LIST"],
    }),
    updateItem: builder.mutation<
      IPaymentPlanItem,
      {
        itemId: number;
        data: {
          paidAmount?: number;
          status?: PaymentPlanItemStatus;
          paidTransactionId?: number;
        };
      }
    >({
      query({ itemId, data }) {
        return {
          url: `/payment-plans/items/${itemId}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["PP_LIST"],
    }),
    cancelPlan: builder.mutation<IPaymentPlan, number>({
      query(id) {
        return {
          url: `/payment-plans/${id}/cancel`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["PP_LIST"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetPlansQuery,
  useGetPlanQuery,
  useCreatePlanMutation,
  useUpdateItemMutation,
  useCancelPlanMutation,
} = paymentPlansApi;
