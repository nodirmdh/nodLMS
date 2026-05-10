import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";
import {
  ITransactions,
  IOneTransaction,
  IPostTransaction,
  IDeptors,
  ISendSMSDeptors,
  ISendSMSDeptorsMessage,
  ICreateTransaction,
  IUpDateTransaction,
  IPropGetTransaction,
} from "@/common/types/transaction.interface";

export const accountingApi = createApi({
  reducerPath: "accountApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UPDATE_ACCOUNT_LIST", "ACCOUNT_GET"],
  endpoints: (builder) => ({
    getAllTransactions: builder.query<ITransactions, IPropGetTransaction>({
      query({ value, page, filter }) {
        return {
          url: `/transactions?type=${value}&page=${page}${filter}`,
        };
      },
      providesTags: ["UPDATE_ACCOUNT_LIST"],
    }),

    getOneTransaction: builder.query<IOneTransaction, string>({
      query: (id) => {
        return {
          url: `/transactions/${id}`,
        };
      },
    }),
    getAllDebtors: builder.query<IDeptors, void>({
      query() {
        return {
          url: `/transactions/debtors`,
        };
      },
      providesTags: ["UPDATE_ACCOUNT_LIST"],
    }),
    sendSms: builder.mutation<ISendSMSDeptorsMessage, ISendSMSDeptors>({
      query(body) {
        return {
          url: "/sms/debtors-group",
          method: "POST",
          body,
        };
      },
    }),
    createTransaction: builder.mutation<ICreateTransaction, IPostTransaction>({
      query(body) {
        return {
          url: `/transactions`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["UPDATE_ACCOUNT_LIST", "ACCOUNT_GET"],
    }),
    patchTransaction: builder.mutation<ICreateTransaction, IUpDateTransaction>({
      query(body) {
        return {
          url: `/transactions/${body.id}`,
          method: "PATCH",
          body: body.data,
        };
      },
      invalidatesTags: ["UPDATE_ACCOUNT_LIST", "ACCOUNT_GET"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetAllTransactionsQuery,
  useCreateTransactionMutation,
  useGetAllDebtorsQuery,
  useGetOneTransactionQuery,
  usePatchTransactionMutation,
  useSendSmsMutation,
} = accountingApi;
