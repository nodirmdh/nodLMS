import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/app/helpers/base-query";

export type NotificationChannel = "sms" | "telegram" | "email" | "push";

export interface INotificationTemplate {
  id: number;
  code: string;
  channel: NotificationChannel;
  locale: string;
  subject: string | null;
  body: string;
  variables: unknown;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTemplateDto {
  code: string;
  channel: NotificationChannel;
  locale?: string;
  subject?: string;
  body: string;
  enabled?: boolean;
}

export interface IUpdateTemplateDto {
  subject?: string;
  body?: string;
  enabled?: boolean;
}

export interface IPreviewResponse {
  id: number;
  code: string;
  channel: NotificationChannel;
  locale: string;
  subject: string | null;
  body: string;
}

export const notificationTemplatesApi = createApi({
  reducerPath: "notificationTemplatesApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["NT_LIST", "NT_ONE"],
  endpoints: (builder) => ({
    listTemplates: builder.query<
      INotificationTemplate[],
      { channel?: NotificationChannel; locale?: string }
    >({
      query({ channel, locale }) {
        const qs = new URLSearchParams();
        if (channel) qs.set("channel", channel);
        if (locale) qs.set("locale", locale);
        const s = qs.toString();
        return {
          url: `/admin/notifications/templates${s ? `?${s}` : ""}`,
        };
      },
      providesTags: ["NT_LIST"],
    }),
    getTemplate: builder.query<INotificationTemplate, number>({
      query(id) {
        return { url: `/admin/notifications/templates/${id}` };
      },
      providesTags: (_r, _e, id) => [{ type: "NT_ONE", id }],
    }),
    createTemplate: builder.mutation<INotificationTemplate, ICreateTemplateDto>(
      {
        query(body) {
          return {
            url: "/admin/notifications/templates",
            method: "POST",
            body,
          };
        },
        invalidatesTags: ["NT_LIST"],
      },
    ),
    updateTemplate: builder.mutation<
      INotificationTemplate,
      { id: number; data: IUpdateTemplateDto }
    >({
      query({ id, data }) {
        return {
          url: `/admin/notifications/templates/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["NT_LIST"],
    }),
    deleteTemplate: builder.mutation<INotificationTemplate, number>({
      query(id) {
        return {
          url: `/admin/notifications/templates/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["NT_LIST"],
    }),
    previewTemplate: builder.mutation<
      IPreviewResponse,
      { id: number; variables?: Record<string, unknown> }
    >({
      query({ id, variables }) {
        return {
          url: `/admin/notifications/templates/${id}/preview`,
          method: "POST",
          body: { variables: variables ?? {} },
        };
      },
    }),
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
});

export const {
  useListTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  usePreviewTemplateMutation,
} = notificationTemplatesApi;
