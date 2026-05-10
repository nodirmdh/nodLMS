import { baseQueryWithAuth } from "@/app/helpers/base-query";
import { createApi } from "@reduxjs/toolkit/query/react";

export const imageApi = createApi({
  reducerPath: "imageApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["photo__post", "ed"],
  endpoints: (builder) => ({
    uploadImage: builder.mutation<{ id: number; url: string }, any>({
      query(body) {
        return {
          url: "/avatars/upload",
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const { useUploadImageMutation } = imageApi;
