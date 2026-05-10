import { z } from "zod";

export const staffSchema = z.object({
  fio: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z.string().min(8, {
    message: "Phone number must be at least 2 characters.",
  }),
  phoneSecond: z.string().optional(),
  documentSeries: z.string().optional(),
  documentNo: z.string().optional(),
  role: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You have to select at least one role.",
  }),
  salaryMentorType: z.string().optional(),
  salaryMentor: z.union([z.string(), z.number()]).optional(),
  branches: z.array(z.coerce.number()).refine((value) => value.length > 0, {
    message: "You have to select at least one branch.",
  }),
  salary: z.union([z.string(), z.number()]).optional(),
  telegram: z.string().optional(),
  sex: z.string().optional(),
  birthday: z.string().optional(),
  socialStatus: z.string().optional(),
  education: z.string().optional(),
  familyStatus: z.string().optional(),
  address: z.string().optional(),
  cardNo: z.string().optional(),
  cardPlaceholder: z.string().optional(),
  avatar: z.string().optional(),
  status: z.string().optional(),
}).superRefine((data, ctx) => {
  // Role ning ichida "mentor" bo'lsa, salaryMentorType majburiy bo'lishi kerak
  if (data.role.includes("mentor") && !data.salaryMentorType) {
    //@ts-ignore
    ctx.addIssue({
      path: ['salaryMentorType'],
      message: "Salary Mentor Type is required when role includes 'mentor'.",
    });
  }
});
