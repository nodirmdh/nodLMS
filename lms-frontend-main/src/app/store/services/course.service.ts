import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";
import { formatNumber } from "@/lib/utils";

export interface CourseBody {
  name: string;
  price: string;
  branchId: string;
}

interface UpdateCourseBody extends CourseBody {
  id: number;
}

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UPDATE_COURSE_LIST", "UPDATE_COURSE"],
  endpoints: (builder) => {
    return {
      getAllCourses: builder.query<any, any>({
        query() {
          return {
            url: `/courses`,
          };
        },
        providesTags: ["UPDATE_COURSE_LIST"],
      }),
      getCoursesSelect: builder.query<{ label: string; value: string }[], void>(
        {
          query() {
            return {
              url: `/courses`,
            };
          },
          //ozgertiw kerek 🧨
          transformResponse: (response: any) => {
            if (response.length) {
              return response.map((res: { id: number; name: string }) => ({
                value: `${res.id}`,
                label: res.name,
              }));
            } else {
              return response;
            }
          },
        }
      ),
      getCourse: builder.query<any, string>({
        query(id) {
          return {
            url: `/courses/${id}`,
            method: "GET",
          };
        },
        transformResponse: (response: any) => {
          return {
            ...response,
            price: String(response.price),
            duration: String(response.duration),
            branchId: String(response.branchId),
          };
        },
      }),
      createCourse: builder.mutation<any, CourseBody>({
        query(body) {
          return {
            url: "/courses",
            method: "POST",
            body: {
              ...body,
              branchId: Number(body.branchId),
              price: parseInt(formatNumber(body.price)),
            },
          };
        },
        invalidatesTags: ["UPDATE_COURSE_LIST"],
      }),
      updateCourse: builder.mutation<any, UpdateCourseBody>({
        query(body) {
          return {
            url: `/courses/${body.id}`,
            method: "PATCH",
            body: {
              ...body,
              branchId: Number(body.branchId),
              price: parseInt(formatNumber(body.price)),
            },
          };
        },
        invalidatesTags: ["UPDATE_COURSE_LIST", "UPDATE_COURSE"],
      }),
    };
  },
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetAllCoursesQuery,
  useGetCoursesSelectQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
} = courseApi;
