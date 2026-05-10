import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().min(2, {
    message: "Phone number must be at least  characters.",
  }),
  address: z.string().min(2, {
    message: "Phone number must be at least  characters.",
  }),
});
