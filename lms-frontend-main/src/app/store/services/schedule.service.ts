import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export interface IDataLesson {
  id: number;
  name: string;
  date: string;
  status: string;
  comment: null | string;
  startTime: string;
  endTime: string;
  groupId: number;
  mentorId: number;
  responsibleId: number;
  students: {
    lessonId: number;
    studentId: number;
    attended: boolean;
    reason: null | string;
    discount: number;
    student: {
      id: number;
      fio: string;
      balance: number;
      phone: string;
      sex: null;
      telegram: null;
      birthday: string;
      status: string;
      fatherFio: null;
      fatherPhone: null;
      fatherJob: null;
      montherFio: null;
      montherPhone: null;
      montherJob: null;
      disability: boolean;
    };
  }[];
  responsible: {
    id: 1;
    fio: "admin";
    phone: "998913778660";
    phoneSecond: null;
    documentSeries: null;
    status: "work";
    documentNo: null;
    salaryMentorType: null;
    salaryMentor: null;
    salary: 0;
    telegram: null;
    sex: null;
    birthday: null;
    socialStatus: null;
    education: null;
    familyStatus: null;
    address: null;
    cardNo: null;
    cardPlaceholder: null;
    balance: 0;
    role: ["CEO"];
  };
  mentor: {
    id: number;
    userId: number;
    user: {
      id: number;
      fio: string;
      phone: string;
      phoneSecond: null;
      documentSeries: null;
      status: string;
      documentNo: null;
      salaryMentorType: string;
      salaryMentor: number;
      salary: number;
      telegram: null | string;
      sex: null | string;
      birthday: null | string;
      socialStatus: null | string;
      education: null | string;
      familyStatus: null | string;
      address: null;
      cardNo: null | string;
      cardPlaceholder: null | string;
      balance: number;
      role: string[];
    };
  };
  group: {
    id: number;
    name: string;
    status: string;
    courseId: number;
    classDays: string[];
    startTime: string;
    endTime: string;
    startDate: string;
    duration: number;
    mentorId: number;
    responsibleId: number;
  };
}

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["SCHEDULE_STUDENTS", "SCHEDULE_STUDENTS_CREATE"],
  endpoints: (builder) => ({
    getLessonsByDate: builder.query<any, any>({
      query(date) {
        return {
          url: `/lessons/get-lessons-by-date`,
          method: "POST",
          body: { date: new Date(date).toISOString() },
        };
      },
      keepUnusedDataFor:0,
      providesTags: ["SCHEDULE_STUDENTS"],
    }),
    checkAttendance: builder.mutation<
      any,
      { id: string; data: { studentId: number; attended: boolean }[] }
    >({
      query: (body) => {
        return {
          url: `/lessons/${body.id}/attendance-mentor`,
          method: "POST",
          body: body.data,
        };
      },
      invalidatesTags: ["SCHEDULE_STUDENTS", "SCHEDULE_STUDENTS_CREATE"],
    }),
    getLesson: builder.query<IDataLesson, string>({
      query(id) {
        return {
          url: `/lessons/${id}`,
        };
      },
      providesTags: ["SCHEDULE_STUDENTS"],
    }),

    checkStudentConfirm: builder.mutation<
      any,
      { data: { attended: boolean; studentId: number }[]; id: string }
    >({
      query: (proms) => {
        return {
          url: `/lessons/${proms.id}/attendance-responsible`,
          method: "POST",
          body: proms.data,
        };
      },
      invalidatesTags: ["SCHEDULE_STUDENTS", "SCHEDULE_STUDENTS_CREATE"],
    }),
    statusPostLesson: builder.mutation<any, { id: string; data: any }>({
      query: (body) => {
        return {
          url: `/lessons/${body.id}`,
          method: "PATCH",
          body: body.data,
        };
      },
      invalidatesTags: ["SCHEDULE_STUDENTS", "SCHEDULE_STUDENTS_CREATE"],
    }),
    postLessonsMentor: builder.mutation<
      any,
      { data: { attended: boolean; studentId: number }[]; id: string }
    >({
      query: (proms) => {
        return {
          url: `/lessons/${proms.id}/attendance-mentor`,
          method: "POST",
          body: proms.data,
        };
      },
      invalidatesTags: ["SCHEDULE_STUDENTS", "SCHEDULE_STUDENTS_CREATE"],
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true, 
});

export const {
  useGetLessonsByDateQuery,
  useGetLessonQuery,
  useStatusPostLessonMutation,
  useCheckAttendanceMutation,
  useCheckStudentConfirmMutation,
} = scheduleApi;
