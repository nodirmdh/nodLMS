import { z } from "zod";

export const confirmfines = z.object({
  name: z.string(),
  userId: z.string(),
  comment: z.string().optional(),
  amount: z.string(),
});
