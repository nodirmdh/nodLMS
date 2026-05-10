import { z } from "zod";

export const exprenceSchema = z.object({
  amount: z.string(),
  comment: z.string().optional(),
  paymentType: z.string().optional(),
  studentId: z.string().optional(),
  userId: z.string().optional(),
  expenseType: z.string().optional(),
  profitType: z.string().optional(),
});
