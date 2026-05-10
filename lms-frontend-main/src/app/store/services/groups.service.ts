import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";
import { format } from "date-fns";

export interface IGroups {
  name: string;
  courseId: string;
  classDays: string[];
  startTime: string;
  endTime: string;
  startDate: Date;
  mentorId: string;
  responsibleId: string;
  groupId?: number;
  duration: number;
}

export interface IPostGroup {
  name: string;
  courseId: number;
  classDays: string[];
  endTime: string;
  startDate: Date;
  date: {
    to: Date;
    from: Date;
  };
  mentorId: number;
  responsibleId: number;
  groupId?: number;
  startTime: string;
}

interface INewData {
  id: number;
  name: string;
  status: string;
  courseId: number;
  classDays: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  responsibleId: number;
  mentor: string;
  course: string;
}
interface IData {
  data: INewData[];
  total: number;
  page: string;
  limit: number;
}

interface IGroup {
  classDays: string[];
  course: {
    branchId: number;
    id: number;
    name: string;
    price: number;
  };
  courseId: number;
  endTime: string;
  groupStudents: {
    groupId: number;
    status: string;
    student: {
      balance: number;
      birthday: string;
      disability: boolean;
      fatherFio: string | null;
      fatherJob: string | null;
      fatherPhone: string | null;
      fio: string;
      id: number;
      montherFio: string | string;
      montherJob: string | string;
      montherPhone: null | string;
      phone: string;
      sex: null | string;
      status: string;
      telegram: null | string;
    };
    studentId: number;
  }[];
  id: number;

  mentor: {
    id: number;
    user: {
      address: null | string;
      balance: number;
      birthday: null | string;
      cardNo: null | string;
      cardPlaceholder: null | string;
      documentNo: null | string;
      documentSeries: null | string;
      education: null | string;
      familyStatus: null | string;
      fio: string;
      id: number;
      phone: string;
      phoneSecond: null | string;
      role: string[];
      salary: number;
      salaryMentor: number;
      salaryMentorType: string;
      sex: null | string;
      socialStatus: null | string;
      status: string;
      telegram: null | string;
    };
    userId: number;
  };
  mentorId: number;
  name: string;
  responsible: {
    address: null | string;
    balance: number;
    birthday: null | string;
    cardNo: null | string;
    cardPlaceholder: null | string;
    documentNo: null | string;
    documentSeries: null | string;
    education: null | string;
    familyStatus: null | string;
    fio: string;
    id: number;
    phone: string;
    phoneSecond: null | string;
    role: string[];
    salary: number;
    salaryMentor: number;
    salaryMentorType: string;
    sex: null | string;
    socialStatus: null | string;
    status: string;
    telegram: null | string;
  };
  responsibleId: number;
  startTime: string;
  status: string;
  lastLessonDate: Date;
  fromDate: Date;
  toDate: Date;
}

interface IGroupStart {
  comment: null | string;
  date: string;
  endTime: string;
  groupId: number;
  id: number;
  mentorId: number;
  name: string;
  responsibleId: number;
  startTime: string;
  status: string;

  students: {
    attended: boolean;
    lessonId: number;
    reason: null | string;
    studentId: number;
  }[];
}

export interface IJurnal {
  lessons: {
    id: number;
    checked: boolean;
    date: string;
    status: string;
    reason: string;
  }[];
  students: {
    fio: string;
    id: number;
    attended: {
      id: number;
      attendend: boolean;
      reason: string;
      checked: boolean;
    }[];
  }[];
}

export const groupApi = createApi({
  reducerPath: "groupApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["GROUPS_CREATE", "GROUPS_UPDATE"],
  endpoints: (builder) => ({
    getGroups: builder.query<IData, { filter: string; page: number }>({
      query: (data) => `/groups?page=${data.page + data.filter}`,
      providesTags: ["GROUPS_CREATE"],
    }),
    //gruppa select ushin active ham waiting grupppa suhin select kerek value string boladi
    getGroupsSelect: builder.query<
      { label: string; value: string }[],
      number | void
    >({
      query: (data) => `/groups${data ? `?take=${data}` : ""}`,
      transformResponse: (response: any) => {
        if (response.data.length) {
          const data = response.data.filter(
            (res: { id: number; name: string; status: string }) => {
              if (res.status === "waiting" || res.status === "active") {
                return {
                  value: `${res.id}`,
                  label: res.name,
                };
              }
            }
          );
          return data.map(
            (res: { id: number; name: string; status: string }) => {
              if (res.status === "waiting" || res.status === "active") {
                return {
                  value: `${res.id}`,
                  label: res.name,
                };
              }
            }
          );
        } else {
          return [];
        }
      },
      providesTags: ["GROUPS_CREATE"],
    }),

    getSelectGroups: builder.mutation<
      { label: string; value: string; coursePrice: number }[],
      { statuses: (string | number)[] }
    >({
      query: (body) => {
        return {
          url: "/groups/select",
          method: "POST",
          body,
        };
      },
      transformResponse: (
        responsible: { label: string; value: string; coursePrice: number }[]
      ) => {
        if (responsible.length > 0) {
          const data = responsible.map((el) => {
            return {
              value: el.value.toString(),
              label: el.label,
              coursePrice: el.coursePrice,
            };
          });
          return data;
        }
        return responsible;
      },
    }),
    getGroup: builder.query<IGroup, string>({
      query: (data) => `/groups/${data}`,
      providesTags: ["GROUPS_CREATE"],
    }),
    createGroup: builder.mutation<IPostGroup, IPostGroup>({
      query: (body) => {
        const fromDate = format(body.date.from, "yyyy-MM-dd'T'00:00:00.000'Z'");
        const toDate = format(body.date.to, "yyyy-MM-dd'T'00:00:00.000'Z'");
        return {
          url: `/groups`,
          method: "POST",
          body: {
            courseId: body.courseId,
            name: body.name,
            mentorId: body.mentorId,
            responsibleId: body.responsibleId,
            startTime: body.startTime,
            endTime: body.endTime,
            classDays: body.classDays,
            toDate,
            fromDate,
          },
        };
      },
      invalidatesTags: ["GROUPS_CREATE"],
    }),

    startGroup: builder.mutation<IGroupStart, string>({
      query: (id) => {
        return {
          url: `/groups/${id}/start-group`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["GROUPS_CREATE", "GROUPS_UPDATE"],
    }),
    editGroup: builder.mutation<any, { data: IPostGroup; id: number }>({
      query: (body) => {
        const fromDate = format(
          body.data.date.from,
          "yyyy-MM-dd'T'00:00:00.000'Z'"
        );
        const toDate = format(
          body.data.date.to,
          "yyyy-MM-dd'T'00:00:00.000'Z'"
        );
        return {
          url: `/groups/${body.id}`,
          method: "PATCH",
          body: {
            courseId: body.data.courseId,
            name: body.data.name,
            mentorId: body.data.mentorId,
            responsibleId: body.data.responsibleId,
            startTime: body.data.startTime,
            endTime: body.data.endTime,
            classDays: body.data.classDays,
            toDate,
            fromDate,
          },
        };
      },
      invalidatesTags: ["GROUPS_CREATE", "GROUPS_UPDATE"],
    }),
    groupPouse: builder.mutation<any, { data: { status: string }; id: number }>(
      {
        query: (body) => {
          return {
            url: `/groups/${body.id}`,
            method: "PATCH",
            body: body.data,
          };
        },
        invalidatesTags: ["GROUPS_CREATE", "GROUPS_UPDATE"],
      }
    ),
    getJurnal: builder.query<IJurnal, { id: string; date: string }>({
      query: ({ id, date }) => {
        return {
          url: `/groups/${id}/lessons?date=${date}`,
        };
      },
      keepUnusedDataFor: 0,
    }),
    groupLessons: builder.query<
      { total: number; lessons: any[] },
      { id: string | number; page: number }
    >({
      query: (body) => `/groups/lessons/${body.id}?page=${body.page}`,
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetGroupQuery,
  useEditGroupMutation,
  useStartGroupMutation,
  useGetGroupsSelectQuery,
  useGroupPouseMutation,
  useGetSelectGroupsMutation,
  useGroupLessonsQuery,
  useGetJurnalQuery,
} = groupApi;
