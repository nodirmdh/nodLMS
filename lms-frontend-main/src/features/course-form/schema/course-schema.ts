import { z } from "zod";

export const courseSchema = z.object({
  name: z.string().nonempty({ message: "" }),
  price: z.string().nonempty({ message: "" }),
  branchId: z.string().nonempty({ message: "" }),
});
