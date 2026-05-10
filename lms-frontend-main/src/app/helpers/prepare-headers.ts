import { BaseQueryApi } from "@reduxjs/toolkit/query";
import { RootState } from "../store/store.config";

export const prepareHeaders = (
  headers: Headers,
  api: Pick<
    BaseQueryApi,
    "getState" | "extra" | "endpoint" | "type" | "forced"
  >,
) => {
  const state = api.getState() as RootState;
  if (state.authState.token) {
    headers.set(
      "Authorization",
      `Bearer ${state.authState.token}`,
    );
  }

  return headers;
};
