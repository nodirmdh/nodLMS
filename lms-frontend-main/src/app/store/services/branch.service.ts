import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export interface BranchBody {
  name: string;
  address: string;
}

interface UpdateBranchBody extends BranchBody {
  id: number;
}

export const branchApi = createApi({
  reducerPath: "branchApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UPDATE_BRANCH_LIST", "UPDATE_BRANCH"],
  endpoints: (builder) => ({
    getAllBranches: builder.query<any, { page: number }>({
      query({ page }) {
        return {
          url: `/branches?page=${page}`,
        };
      },
      providesTags: ["UPDATE_BRANCH_LIST"],
    }),

    getBranchesSelect: builder.query<{ label: string; value: string }[], void>({
      query() {
        return {
          url: `/branches`,
        };
      },
      transformResponse: (response: any) => {
        if (response.data.length) {
          return response.data.map((res: { id: number; name: string }) => ({
            value: String(res.id),
            label: res.name,
          }));
        } else {
          return [];
        }
      },
    }),
    getBranch: builder.query<any, string>({
      query(id) {
        return {
          url: `/branches/${id}`,
          method: "GET",
        };
      },
    }),
    createBranch: builder.mutation<any, BranchBody>({
      query(body) {
        return {
          url: "/branches",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["UPDATE_BRANCH_LIST"],
    }),
    updateBranch: builder.mutation<any, UpdateBranchBody>({
      query(body) {
        return {
          url: `/branches/${body.id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["UPDATE_BRANCH_LIST", "UPDATE_BRANCH"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetAllBranchesQuery,
  useGetBranchesSelectQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useGetBranchQuery,
} = branchApi;
