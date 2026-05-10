import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";
import {
  IBonuses,
  IPostBonus,
  IUpDateBonus,
  IBonus,
  IBonusPostMessage,
  IBonusProp,
} from "@/common/types/bonus-fines.interface";

export const fineApi = createApi({
  reducerPath: "fineApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UPDATE_FINE_LIST", "FINES_GET"],
  endpoints: (builder) => ({
    getAllFines: builder.query<IBonuses, IBonusProp>({
      query(data) {
        return {
          url: `/fine?page=${data.page + data.filter}`,
        };
      },
      providesTags: ["UPDATE_FINE_LIST"],
    }),
    getFine: builder.query<IBonus, string>({
      query(id) {
        return {
          url: `/fine/${id}`,
        };
      },
      providesTags: ["UPDATE_FINE_LIST"],
    }),
    createFine: builder.mutation<IBonusPostMessage, IPostBonus>({
      query(body) {
        return {
          url: `/fine`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["UPDATE_FINE_LIST", "FINES_GET"],
    }),
    upDateFine: builder.mutation<IBonusPostMessage, IUpDateBonus>({
      query(body) {
        return {
          url: `/fine/${body.id}`,
          method: "PATCH",
          body: body.data,
        };
      },
      invalidatesTags: ["UPDATE_FINE_LIST", "FINES_GET"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetAllFinesQuery,
  useCreateFineMutation,
  useGetFineQuery,
  useUpDateFineMutation,
} = fineApi;
