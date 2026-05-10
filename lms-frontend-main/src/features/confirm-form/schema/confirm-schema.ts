import { z } from "zod";

export const confirmSchema = z.object({
  code: z.string().min(2, {
    message: "Phone number must be at least  characters.",
  }),
});
