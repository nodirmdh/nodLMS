import { z } from "zod";

export const exprenceSchema = z.object({
  name: z.string({
    message: "Phone number must be at least  characters.",
  }),
  amount: z.string({
    message: "Phone number must be at least  characters.",
  }),
  comment: z.string().optional(),
  studentId: z.coerce.number(),
  userId:z.string().optional()
});
