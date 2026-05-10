import { z } from "zod";

export const leedSchema = z.object({
  fio: z.string().min(2, {
    message: "",
  }),
  phone: z.string().min(2, {
    message: "",
  }),
  discoveryMethod: z.string().min(2, {
    message: "",
  }),
  comment: z.string().optional(),
  startTime: z.string().min(2, {
    message: "",
  }),
  endTime: z.string().min(2, {
    message: "",
  }),
  classDays: z.array(z.string()).min(1, {
    message: "",
  }),
  courseId: z.string().min(1, {
    message: "",
  }),
});
