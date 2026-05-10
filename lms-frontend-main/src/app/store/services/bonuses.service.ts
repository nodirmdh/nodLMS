import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";
import {
  IBonuses,
  IBonusesResponce,
  IPostBonus,
  IUpDateBonus,
  IBonus,
  IBonusProp,
  IBonusPostMessage,
} from "@/common/types/bonus-fines.interface";

export const bonusApi = createApi({
  reducerPath: "bonusApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UPDATE_BONUS_LIST", "GET_BONUS"],
  endpoints: (builder) => ({
    getAllBonuses: builder.query<IBonuses, IBonusProp>({
      query(data) {
        return {
          url: `/bonus?page=${data.page + data.filter}`,
        };
      },
      // usi jerge itibar menen qaraw kerek 🧨
      transformResponse: (res: IBonusesResponce) => ({
        data: res.data.map((item) => ({
          ...item,
          author: item.author.fio,
          user: item.user.fio,
        })),
        limit: res.limit,
        page: res.page,
        total: res.total,
      }),
      providesTags: ["UPDATE_BONUS_LIST"],
    }),
    getBonus: builder.query<IBonus, string>({
      query(id) {
        return {
          url: `/bonus/${id}`,
        };
      },
      providesTags: ["UPDATE_BONUS_LIST"],
    }),
    createBonus: builder.mutation<IBonusPostMessage, IPostBonus>({
      query(body) {
        return {
          url: "/bonus",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["UPDATE_BONUS_LIST", "GET_BONUS"],
    }),
    upDateBonus: builder.mutation<IBonusPostMessage, IUpDateBonus>({
      query(body) {
        return {
          url: `/bonus/${body.id}`,
          method: "PATCH",
          body: body.data,
        };
      },
      invalidatesTags: ["UPDATE_BONUS_LIST", "GET_BONUS"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetAllBonusesQuery,
  useCreateBonusMutation,
  useUpDateBonusMutation,
  useGetBonusQuery,
} = bonusApi;
