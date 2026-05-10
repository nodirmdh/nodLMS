import { z } from "zod";

export const exprenceSchema = z.object({
  type:z.string(
    {
      message: "Phone number must be at least  characters.",
    }
  ),
  amount: z.string({
    message: "Phone number must be at least  characters.",
  }),
  comment: z.string().optional(),
  paymentType: z.string(),//tolem turi 
  studentId: z.coerce.number(),
  profitType: z.string(),//vznos
  userId:z.string().optional()
});
