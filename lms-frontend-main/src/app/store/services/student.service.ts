import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";
import { formatNumber } from "@/lib/utils";
import {
  IStundets,
  ICreateStudent,
  OneStudentType,
  OneStudentTypeResponce,
} from "@/common/types/students.interface";

export const studentAPI = createApi({
  reducerPath: "studentAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["STUDENT_USER", "STUDENT_UPDATE"],
  endpoints: (builder) => ({
    getStudents: builder.query<
      IStundets,
      { filter: string; search: string; page: number; branch: number | null }
    >({
      query: (data) => {
        return {
          url: `/students?page=${data.page}${
            data.filter ? data.filter : `&branchId=${data.branch}`
          }${data.search ? "&fio=" + data.search : ""}`,
        };
      },
      providesTags: ["STUDENT_USER"],
    }),

    getGroups: builder.query<{ value: number; label: string }[], void>({
      query: () => {
        return {
          url: "/groups",
        };
      },
      transformResponse: (response: any) => {
        if (response.data.length) {
          return response.data.map((res: { id: number; name: string }) => ({
            value: res.id,
            label: res.name,
          }));
        } else {
          return response;
        }
      },
    }),
    getStudent: builder.query<OneStudentType, string>({
      query: (id) => {
        return {
          url: `/students/${id}`,
        };
      },
      transformResponse: (response: OneStudentTypeResponce) => {
        if (response) {
          const transformedLessons = response.lessons.map((lesson) => ({
            ...lesson.lesson,
            lessonId: lesson.lessonId,
            studentId: lesson.studentId,
            attended: lesson.attended,
            reason: lesson.reason,
          }));
          const groupStudents = response.groupStudents.map((el) => ({
            ...el,
            name: el.group.name,
            startTime: el.group.startTime,
            endTime: el.group.endTime,
          }));

          return {
            ...response,
            lessons: transformedLessons,
            groupStudents: groupStudents,
          };
        }
        return response;
      },
    }),
    postStudents: builder.mutation<any, ICreateStudent>({
      query: (body) => {
        return {
          url: "/students",
          method: "POST",
          body: {
            ...body,
            disability: body.disability
              ? body.disability === "true"
                ? true
                : false
              : false,
            groups: body.groups?.map((item) => {
              return {
                ...item,
                discount: parseInt(formatNumber(`${item.discount}`)),
              };
            }),
          },
        };
      },
      invalidatesTags: ["STUDENT_USER"],
    }),
    putStudents: builder.mutation<any, { id: string; data: ICreateStudent }>({
      query: (body) => {
        return {
          url: `/students/${body.id}`,
          method: "PATCH",
          body: {
            ...body.data,
            disability: body.data.disability
              ? body.data.disability === "true"
                ? true
                : false
              : false,
          },
        };
      },
      invalidatesTags: ["STUDENT_USER"],
    }),
    expulisonGroup: builder.mutation<any, any>({
      query: (body) => {
        return {
          url: "",
          method: "POST",
          body,
        };
      },
    }),
    bonusStudent: builder.mutation<any, { id: number; data: any }>({
      query: (body) => {
        return {
          url: `/students/bonus/${body.id}`,
          method: "POST",
          body: body.data,
        };
      },
      invalidatesTags: ["STUDENT_USER", "STUDENT_UPDATE"],
    }),
    deleateBonusStudent: builder.mutation<any, number>({
      query: (id) => {
        return {
          url: `/students/bonus/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["STUDENT_USER"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetStudentsQuery,
  usePostStudentsMutation,
  useGetGroupsQuery,
  useGetStudentQuery,
  usePutStudentsMutation,
  useExpulisonGroupMutation,
  useBonusStudentMutation,
  useDeleateBonusStudentMutation,
} = studentAPI;
