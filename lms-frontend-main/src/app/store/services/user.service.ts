import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";
import { setUser } from "../features/user.feature";
import { cleanObject } from "@/lib/utils";
import {
  IUser,
  IUsers,
  IUsersGetProp,
  SelectType,
  IUserCreate,
  UserCreateMessage,
  IPostFillal,
  IUpdateUser,
  IUserMe,
} from "@/common/types/user.interface";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UPDATE_USER_LIST", "UPDATE_USER"],
  endpoints: (builder) => ({
    getMe: builder.query<IUserMe, void>({
      query() {
        return {
          url: `/auth/me`,
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch (error) {
          console.error("Confirm mutation failed:", error);
        }
      },
      keepUnusedDataFor: 0,
      providesTags: ["UPDATE_USER_LIST"],
    }),
    getAllUsers: builder.query<IUsers, IUsersGetProp>({
      query(data) {
        return {
          url: `/users${
            (data.filter || data.search) &&
            (data.filter
              ? data.search
                ? "?" + data.filter.substring(1) + "&fio=" + data.search
                : "?" + data.filter.substring(1)
              : "?fio=" + data.search)
          }`,
        };
      },
      transformResponse: (response: any) => {
        if (response.length) {
          return response.map((res: any) => ({
            ...res,
            branches: res.branches.map((branch: any) => branch.name),
          }));
        } else {
          return response;
        }
      },
      providesTags: ["UPDATE_USER_LIST"],
    }),

    // usi jerge itibar menen qaraw kerek 🧨
    getResponsiblesSelect: builder.query<SelectType, void>({
      query() {
        return {
          url: `/users/responsibles`,
        };
      },
      transformResponse: (response: { value: number; label: string }[]) => {
        if (response.length > 0) {
          return response.map((res: any) => ({
            ...res,
            value: `${res.value}`,
          }));
        }
        return response;
      },
    }),
    getUser: builder.query<IUser, string>({
      query(id) {
        return {
          url: `/users/${id}`,
        };
      },
      providesTags: ["UPDATE_USER_LIST"],
    }),
    createUser: builder.mutation<UserCreateMessage, IUserCreate>({
      query(body) {
        return {
          url: `/users`,
          method: "POST",
          body: cleanObject({
            ...body,
          }),
        };
      },
      invalidatesTags: ["UPDATE_USER_LIST"],
    }),
    updateUser: builder.mutation<UserCreateMessage, IUpdateUser>({
      query(body) {
        return {
          url: `/users/${body.id}`,
          method: "PATCH",
          body: cleanObject({
            ...body,
            salary: body.salary ? body.salary : 0,
          }),
        };
      },
      invalidatesTags: ["UPDATE_USER_LIST", "UPDATE_USER"],
    }),
    // usi jerge itibar menen qaraw kerek 🧨
    getUsersSelect: builder.query<SelectType, void>({
      query() {
        return {
          url: `/users`,
        };
      },
      transformResponse: (response: any) => {
        if (response.length) {
          return response.map((res: any) => ({
            value: String(res.id),
            label: res.fio,
          }));
        } else {
          return response;
        }
      },
    }),
    postSetFillal: builder.mutation<UserCreateMessage, IPostFillal>({
      query(body) {
        return {
          url: `/users/${body.id}/settings`,
          method: "PATCH",
          body: body.data,
        };
      },
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useGetMeQuery,
  useGetAllUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetUsersSelectQuery,
  useGetResponsiblesSelectQuery,
  usePostSetFillalMutation,
} = userApi;
