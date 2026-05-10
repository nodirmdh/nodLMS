import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export type LeedStatus =
  | "new"
  | "refused"
  | "waitingGroup"
  | "inGroup"
  | "finished";

export interface IKanbanLeed {
  id: number;
  fio: string;
  phone: string;
  discoveryMethod: string;
  status: LeedStatus;
  comment: string;
  startTime: string;
  endTime: string;
  classDays: string[];
  courseId: number | null;
  authorId: number | null;
  date: string | null;
  position: number;
  refusedReason: string | null;
  course?: { id: number; name: string } | null;
  author?: { id: number; fio: string } | null;
}

export interface IKanbanColumn {
  status: LeedStatus;
  count: number;
  items: IKanbanLeed[];
}

export interface IKanbanResponse {
  columns: IKanbanColumn[];
  total: number;
}

export const leedsKanbanApi = createApi({
  reducerPath: "leedsKanbanApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["KANBAN"],
  endpoints: (builder) => ({
    getKanban: builder.query<IKanbanResponse, void>({
      query() {
        return { url: "/leeds/kanban" };
      },
      providesTags: ["KANBAN"],
    }),
    moveLeed: builder.mutation<
      unknown,
      {
        id: number;
        status?: LeedStatus;
        position?: number;
        refusedReason?: string;
      }
    >({
      query({ id, ...data }) {
        return { url: `/leeds/${id}/move`, method: "PATCH", body: data };
      },
      invalidatesTags: ["KANBAN"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const { useGetKanbanQuery, useMoveLeedMutation } = leedsKanbanApi;
