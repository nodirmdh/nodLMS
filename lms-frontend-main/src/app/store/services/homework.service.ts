import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export type HomeworkSubmissionStatus = "submitted" | "reviewed" | "returned";

export interface IHomework {
  id: number;
  title: string;
  description: string;
  groupId: number | null;
  lessonId: number | null;
  dueDate: string | null;
  attachments: string[] | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { submissions: number };
  submissions?: IHomeworkSubmission[];
}

export interface IHomeworkSubmission {
  id: number;
  homeworkId: number;
  studentId: number;
  comment: string | null;
  files: string[] | null;
  grade: number | null;
  reviewerComment: string | null;
  status: HomeworkSubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
}

export interface ICreateHomeworkDto {
  title: string;
  description: string;
  groupId?: number;
  lessonId?: number;
  dueDate?: string;
  attachments?: string[];
}

export interface ISubmitHomeworkDto {
  studentId: number;
  comment?: string;
  files?: string[];
}

export interface IReviewDto {
  grade?: number;
  reviewerComment?: string;
  status?: HomeworkSubmissionStatus;
}

export const homeworkApi = createApi({
  reducerPath: "homeworkApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["HW_LIST", "HW_ONE", "HW_SUBMISSIONS"],
  endpoints: (builder) => ({
    getHomeworks: builder.query<
      IHomework[],
      { groupId?: number; lessonId?: number }
    >({
      query({ groupId, lessonId }) {
        const qs = new URLSearchParams();
        if (groupId != null) qs.set("groupId", String(groupId));
        if (lessonId != null) qs.set("lessonId", String(lessonId));
        const s = qs.toString();
        return { url: `/homework${s ? `?${s}` : ""}` };
      },
      providesTags: ["HW_LIST"],
    }),
    getHomework: builder.query<IHomework, number>({
      query(id) {
        return { url: `/homework/${id}` };
      },
      providesTags: (_r, _e, id) => [{ type: "HW_ONE", id }],
    }),
    createHomework: builder.mutation<IHomework, ICreateHomeworkDto>({
      query(body) {
        return { url: "/homework", method: "POST", body };
      },
      invalidatesTags: ["HW_LIST"],
    }),
    submitHomework: builder.mutation<
      IHomeworkSubmission,
      { homeworkId: number; data: ISubmitHomeworkDto }
    >({
      query({ homeworkId, data }) {
        return {
          url: `/homework/${homeworkId}/submissions`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: (_r, _e, { homeworkId }) => [
        { type: "HW_ONE", id: homeworkId },
        "HW_SUBMISSIONS",
      ],
    }),
    reviewSubmission: builder.mutation<
      IHomeworkSubmission,
      { submissionId: number; data: IReviewDto }
    >({
      query({ submissionId, data }) {
        return {
          url: `/homework/submissions/${submissionId}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["HW_LIST", "HW_SUBMISSIONS"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetHomeworksQuery,
  useGetHomeworkQuery,
  useCreateHomeworkMutation,
  useSubmitHomeworkMutation,
  useReviewSubmissionMutation,
} = homeworkApi;
