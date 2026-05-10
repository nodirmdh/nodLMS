import { baseQueryWithAuth } from "@/app/helpers/base-query";
import { createApi } from "@reduxjs/toolkit/query/react";

interface DataItem {
    id: number;
    name: string;
    groupId: number;
    status: string;
    responsibleId: number;
    comments: string;
    date: string;
  }
  
  interface ApiResponse {
    data: DataItem[];
    total: number;
    page: number;
    limit: number;
  }

export  interface IPostExam {
    name:string;
    date?:Date;
    groupId:number;
    responsibleId:number;
    comments?:string
  }

  interface Student {
    id: number;
    fio: string;
    balance: number;
    phone: string;
    sex: string | null;
    telegram: string | null;
    birthday: string;
    pinfl: string | null;
    status: string;
    fatherFio: string | null;
    fatherPhone: string | null;
    fatherJob: string | null;
    montherFio: string | null;
    montherPhone: string | null;
    montherJob: string | null;
    disability: boolean;
    avatar: string | null;
  }
  
  interface GroupStudent {
    groupId: number;
    studentId: number;
    discount: number;
    discountComment: string | null;
    status: string;
    student: Student;
  }
  
  interface Group {
    id: number;
    name: string;
    status: string;
    courseId: number;
    classDays: string[];
    startTime: string;
    endTime: string;
    fromDate: string;
    toDate: string;
    mentorId: number;
    responsibleId: number;
    groupStudents: GroupStudent[];
  }
  
  interface Grade {
    id: number;
    examId: number;
    studentId: number;
    grade: number;
    comment: string;
    student: Student;
  }
  interface IOneExamData {
    id: number;
    name: string;
    groupId: number;
    status: string;
    responsible: {
      id:number;
      fio:string;
    };
    responsibleId: number;
    comments: string;
    date: Date;
    group: Group;
    grades: Grade[];
  }

  // interface IExamBatch{
  //   studentId:number;
  //   grade:number;
  //   comment?:string
  // }[]
export const testApi=createApi({
    reducerPath:"testApi",
    baseQuery:baseQueryWithAuth,
    tagTypes:["EXAMS__GET","EXAMS__POST"], 
    endpoints:(builder)=>({
        getExams:builder.query<ApiResponse,{page:number;filter:string}>({
            query:(data)=>{
                return{
                    url:`exam?page=${data.page}${data.filter}`
                }
            },
            providesTags:["EXAMS__GET"]
        }),
        getOneExam:builder.query<IOneExamData,string>({
            query:(id)=>{
                return{
                    url:`exam/${id}`
                }
            },
            providesTags:["EXAMS__GET"]
        }),
        postExam:builder.mutation<any,IPostExam>({
            query:(body)=>{
                return{
                    url:"/exam",
                    method:"POST",
                    body
                }
            },
            invalidatesTags:["EXAMS__GET","EXAMS__POST"]
        }),
        postExamBanch:builder.mutation<any,{id:string;data:{studentId: number;grade: number; comment: string;}[]}>({
            query:(body)=>{
                return{
                    url:`/exam/${body.id}/batch-add`,
                    method:"POST",
                    body:body.data
                }
            },
            invalidatesTags:["EXAMS__GET","EXAMS__POST"]
        }),
        patchExam:builder.mutation<any,{data:IPostExam,id:string}>({
          query:(body)=>{
              return{
                  url:`/exam/${body.id}`,
                  method:"PATCH",
                  body:body.data
              }
          },
          invalidatesTags:["EXAMS__GET","EXAMS__POST"]
      }),
    }),
    keepUnusedDataFor: 0,
    refetchOnMountOrArgChange: true, 
})

export const {useGetExamsQuery,usePostExamMutation,useGetOneExamQuery,usePostExamBanchMutation,usePatchExamMutation}=testApi