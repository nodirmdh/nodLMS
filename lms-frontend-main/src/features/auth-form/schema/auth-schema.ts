import { z } from "zod";

export const authSchema = z.object({
  phone: z.string().min(2, {
    message: "Phone number must be at least  characters.",
  }),
});
