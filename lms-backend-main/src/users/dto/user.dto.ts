import { MentorSalaryType, Role } from '@prisma/client';
import { BranchDto } from 'src/branches/dto/branch.dto';

export class UserDto {
  id: number;
  fio: string;
  phone: string;
  phoneSecond: string;
  documentSeries: string;
  documentNo: string;
  salaryMentorType: MentorSalaryType;
  salaryMentor: number;
  salary: number;
  telegram: string;
  sex: string;
  birthday: string;
  socialStatus: string;
  education: string;
  familyStatus: string;
  address: string;
  cardNo: string;
  cardPlaceholder: string;
  balance: number;
  role: Role[];
  branches: BranchDto[];
}
