import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/app/helpers/base-query";
import { setAuth } from "../features/auth.feature";

import {
  LoginResponse,
  AuthBody,
  ConfirmBody,
} from "@/common/types/auth.interface";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, AuthBody>({
      query(body) {
        return {
          url: "/auth/login",
          method: "POST",
          body,
        };
      },
    }),
    confirm: builder.mutation<{ token: string }, ConfirmBody>({
      query(body) {
        return {
          url: "/auth/confirm",
          method: "POST",
          body,
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuth(data.token));
        } catch (error) {
          console.error("Confirm mutation failed:", error);
        }
      },
    }),
    newsms: builder.mutation<LoginResponse, { phone: string }>({
      query(body) {
        return {
          url: "/auth/send-sms",
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const { useLoginMutation, useConfirmMutation, useNewsmsMutation } =
  authApi;
