import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export interface ILeedBody {
  fio: string;
  phone: string;
  discoveryMethod: string;
  comment?: string;
  startTime: string;
  endTime: string;
  classDays: string[];
  courseId:string;
  status?:string;
}

export interface ILeed {
  id: number;
  fio: string;
  phone: string;
  discoveryMethod: string;
  status: string;
  comment: string;
  startTime: string;
  endTime: string;
  classDays: string[];
  courseId: string;
  authorId: number | null;
  date: string | null;
}

export const leedApi = createApi({
  reducerPath: "leedApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["CREATE_LEED", "LEEDS_ALL"],
  endpoints: (builder) => ({
    getAllLeeds: builder.query<any, any>({
      query() {
        return {
          url: `/leeds`,
        };
      },
      providesTags: ["CREATE_LEED"],
    }),
    getLeed: builder.query<ILeed, string>({
      query(id) {
        return {
          url: `/leeds/${id}`,
        };
      }
    }),
    createLeed: builder.mutation<any, ILeedBody>({
      query(body) {
        return {
          url: `/leeds`,
          method: "POST",
          body,
        };
      },
      
      invalidatesTags: ["CREATE_LEED", "LEEDS_ALL"],
    }),
    updateLeed: builder.mutation<any, {data:any;id:string}>({
      query(body) {
        return {
          url: `/leeds/${body.id}`,
          method: "PATCH",
          body:body.data
        };
      },
      invalidatesTags: ["CREATE_LEED", "LEEDS_ALL"],
    })
  }),
  keepUnusedDataFor: 0,  // Данные будут сразу удаляться из кеша
  refetchOnMountOrArgChange: true, 
});

export const {
  useGetAllLeedsQuery,
  useGetLeedQuery,
  useCreateLeedMutation,
  useUpdateLeedMutation,
} = leedApi;
