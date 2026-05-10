import { z } from "zod";
export const lessonStatusSchema = z.object({
  status: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  comment: z.string().optional(),
  date: z.coerce.date().optional(),
  mentorId: z.string().optional(),
});
