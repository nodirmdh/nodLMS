import { z } from "zod";

export const groupSchema = z.object({
  courseId: z.string().nonempty({ message: "" }),
  name: z.string(),
  mentorId: z.string(),
  responsibleId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  classDays: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "",
  }),
  date: z.object({ from: z.date(), to: z.date() }),
});
