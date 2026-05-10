import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";


export interface IOneLessonPost {
  name: string;
  startTime: string;
  endTime: string;
  comment: string;
  date: Date;
  responsibleId: number;
}

export const lessonsApi = createApi({
  reducerPath: "lessonsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["CREATE_LESSONS", "LESSONS_ALL", "LESSONS"],
  endpoints: (builder) => ({
    postLessonOne: builder.mutation<any, IOneLessonPost>({
      query(body) {
        const localDate = new Date(body.date);
        const utcDate = new Date(
          Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            0,
            0,
            0
          )
        );
        return {
          url: `/lessons`,
          method: "POST",
          body: { ...body, date: utcDate },
        };
      },
    }),
  }),
});

export const { usePostLessonOneMutation } = lessonsApi;
