import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export type TaskStatus = "pending" | "inProgress" | "done" | "cancelled";

export interface ITask {
  id: number;
  title: string;
  description: string | null;
  dueAt: string | null;
  assignedTo: number | null;
  relatedEntity: string | null;
  relatedId: number | null;
  status: TaskStatus;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTaskDto {
  title: string;
  description?: string;
  dueAt?: string;
  assignedTo?: number;
  relatedEntity?: string;
  relatedId?: number;
}

export interface IUpdateTaskDto {
  title?: string;
  description?: string;
  dueAt?: string;
  assignedTo?: number;
  status?: TaskStatus;
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["TASKS_LIST", "TASKS_AGENDA"],
  endpoints: (builder) => ({
    getTasks: builder.query<
      ITask[],
      {
        mine?: boolean;
        status?: TaskStatus;
        assignedTo?: number;
        relatedEntity?: string;
        relatedId?: number;
      }
    >({
      query(filter) {
        const params = new URLSearchParams();
        if (filter.mine) params.set("mine", "true");
        if (filter.status) params.set("status", filter.status);
        if (filter.assignedTo != null)
          params.set("assignedTo", String(filter.assignedTo));
        if (filter.relatedEntity)
          params.set("relatedEntity", filter.relatedEntity);
        if (filter.relatedId != null)
          params.set("relatedId", String(filter.relatedId));
        const qs = params.toString();
        return { url: `/tasks${qs ? `?${qs}` : ""}` };
      },
      providesTags: ["TASKS_LIST"],
    }),
    getAgenda: builder.query<ITask[], void>({
      query() {
        return { url: "/tasks/agenda" };
      },
      providesTags: ["TASKS_AGENDA"],
    }),
    createTask: builder.mutation<ITask, ICreateTaskDto>({
      query(body) {
        return { url: "/tasks", method: "POST", body };
      },
      invalidatesTags: ["TASKS_LIST", "TASKS_AGENDA"],
    }),
    updateTask: builder.mutation<ITask, { id: number; data: IUpdateTaskDto }>({
      query({ id, data }) {
        return { url: `/tasks/${id}`, method: "PATCH", body: data };
      },
      invalidatesTags: ["TASKS_LIST", "TASKS_AGENDA"],
    }),
    deleteTask: builder.mutation<ITask, number>({
      query(id) {
        return { url: `/tasks/${id}`, method: "DELETE" };
      },
      invalidatesTags: ["TASKS_LIST", "TASKS_AGENDA"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetTasksQuery,
  useGetAgendaQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
