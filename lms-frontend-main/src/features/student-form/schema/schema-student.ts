import { z } from "zod";

export const schemaStudent = z.object({
  leadId: z.coerce.number().optional(),
  fio: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  disability: z.string().optional(),
  fatherFio: z.string().optional(),
  fatherJob: z.string().optional(),
  fatherPhone: z.string().optional(),
  montherFio: z.string().optional(),
  montherJob: z.string().optional(),
  montherPhone: z.string().optional(),
  sex: z.string().optional(),
  telegram: z.optional(z.string()),
  avatar:z.string().optional(),
  groups: z.array(z.object({
    groupId: z.string(),
    discount: z.coerce.number(),
    discountComment: z.string(),
  })),
  pinfl: z.optional(z.string()),
  documentSeries: z.optional(z.string()),
  documentNo: z.string().optional(),
});
