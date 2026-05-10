import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string({ required_error: "" }),
  startTime: z.string({ required_error: "" }),
  endTime: z.string({ required_error: "" }),
  comment: z.string({ required_error: "" }),
  date: z.date({ required_error: "" }),
  responsibleId: z.string({ required_error: "" }),
});
