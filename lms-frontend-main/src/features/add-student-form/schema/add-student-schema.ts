import { z } from "zod";

export const addStudentSchema = z.object({
  groupId: z.string(),
  discount: z.union([z.coerce.number(), z.string()]),
  discountComment: z.string().optional(),
});
