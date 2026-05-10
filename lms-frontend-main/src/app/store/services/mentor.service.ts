import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

interface IUser {
  avatar: string;
  address: string;
  balance: number;
  birthday: string;
  cardNo: null | number;
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
  availableBalance: number;
  paymentBalance: number;
  acceptedBalance?: number;
  bonusesReceived: {
    id: number;
    name: string;
    date: string;
    amount: number;
    comment: string;
    userId: number;
    authorId: number;
    branchId: number;
  }[];
  finesReceived: {
    id: number;
    name: string;
    date: string; // Agar `Date` obyektini ishlatishni istasangiz, string o‘rniga `Date` ni qo'yishingiz mumkin
    amount: number;
    comment: string;
    userId: number;
    authorId: number;
    branchId: number;
  }[];
  transactions: [];
}

interface IMentor {
  id: number;

  userId: number;
  user: IUser;
  lessons: {
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
  }[];
  groups: {
    id: number;
    name: string;
    status: string;
    courseId: number;
    classDays: string[];
    toDate: Date;
    fromDate: Date;
    startTime: string;
    endTime: string;
    mentorId: number;
    responsibleId: number;
  }[];
  courses: { id: number; name: string; price: number; branchId: number }[];
  studentBonuses: [];
}

interface IMentors {
  id: number;
  userId: number;
  user: {
    acceptedBalance?: number;
    address: string;
    balance: number;
    birthday: string;
    cardNo: null | number;
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
  groups: {
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
    // course: {
    //   name: string;
    //   id: number;
    // };
  }[];
  // course?: [
  //   {
  //     name: string;
  //     id: number;
  //   }
  // ];
}

export const mentorApi = createApi({
  reducerPath: "mentorApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getMentors: builder.query<IMentors[], string | void>({
      query(data) {
        return {
          url: `/mentors${data ? `?${data.substring(1)}` : ""}`,
        };
      },
    }),

    getMentor: builder.query<IMentor, string>({
      query(id) {
        return {
          url: `/mentors/${id}`,
        };
      },
    }),
    getMentorsSelect: builder.query<any, any>({
      query() {
        return {
          url: `/mentors`,
        };
      },
      transformResponse: (response: any) => {
        if (response.length) {
          return response.map((res: any) => ({
            value: `${res.id}`,
            label: res.user.fio,
          }));
        } else {
          return response;
        }
      },
    }),
    getMentorsProssentSelect: builder.query<
      { label: string; value: string }[],
      void
    >({
      query: () => {
        return {
          url: "/mentors/percent-mentors",
        };
      },
      transformResponse: (response: { label: string; value: string }[]) => {
        if (response.length > 0) {
          return response.map((el) => {
            return {
              value: `${el.value}`,
              label: el.label,
            };
          });
        }
        return response;
      },
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetMentorsQuery,
  useGetMentorsSelectQuery,
  useGetMentorQuery,
  useGetMentorsProssentSelectQuery,
} = mentorApi;
