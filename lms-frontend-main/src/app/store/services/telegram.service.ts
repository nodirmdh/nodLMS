import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export interface ITelegramLink {
  id: number;
  userId: number | null;
  studentId: number | null;
  telegramUserId: string;
  username: string | null;
  linkCode: string | null;
  active: boolean;
  linkedAt: string;
  lastSeenAt: string | null;
}

export const telegramApi = createApi({
  reducerPath: "telegramApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    issueLinkCode: builder.mutation<
      ITelegramLink,
      { studentId?: number; userId?: number }
    >({
      query(body) {
        return { url: "/telegram/link-codes", method: "POST", body };
      },
    }),
  }),
});

export const { useIssueLinkCodeMutation } = telegramApi;
