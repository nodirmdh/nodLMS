import { z } from "zod";

export const testSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  date: z
    .union([z.date(), z.string().transform((val) => new Date(val))])
    .optional(),
  groupId: z.string().nonempty({ message: "" }),
  comments: z.string().optional(),
  responsibleId: z.string().nonempty({ message: "" }),
});
