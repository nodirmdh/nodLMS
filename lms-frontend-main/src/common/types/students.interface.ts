interface IBonus {
  id: number;
  name: string;
  date: Date;
  amount: number;
  authorId: number;
  comment: string;
}

interface ILessonSchedule {
  id: number;
  name: string;
  status: string;
  courseId: number;
  classDays: string[];
  startTime: string;
  endTime: string;
  fromDate: Date;
  toDate: Date;
  mentorId: number;
  responsibleId: number;
}

interface ITransaction {
  id: number;
  type: string;
  date: Date;
  amount: number;
  authorId: number;
  comment: string;
  paymentType: string;
  studentId: number;
  userId: number;
  expenseType: null;
  profitType: string;
  branchId: number;
}

interface IInGroupStudent {
  groupId: number;
  studentId: number;
  discount: number;
  discountComment: string | null;
  status: string;
  group: ILessonSchedule;
}

interface ILesson {
  lessonId: number;
  studentId: number;
  attended: boolean;
  reason: string;
  lesson: {
    id: number;
    name: string;
    date: string;
    status: string;
    comment: string;
    startTime: string;
    endTime: string;
    groupId: number;
    mentorId: number;
    responsibleId: number;
  };
}

interface IEditLesson {
  lessonId: number;
  studentId: number;
  attended: boolean;
  reason: string;
  id: number;
  name: string;
  date: string;
  status: string;
  comment: string;
  startTime: string;
  endTime: string;
  groupId: number;
  mentorId: number;
  responsibleId: number;
}

type Course = {
  id: number;
  name: string;
  price: number;
  branchId: number;
};

export interface IStudent {
  id: number;
  fio: string;
  balance: number;
  phone: string;
  sex: string;
  telegram?: string;
  documentSeries: string;
  documentNo: string;
  birthday: string;
  pinfl: string;
  status: string;
  fatherFio: string;
  fatherPhone: string;
  fatherJob: string;
  montherFio: string;
  montherPhone: string;
  montherJob: string;
  disability: boolean;
  avatar: string;
  courses: Course[];
  groups: {
    groupId: string;
    discount: number;
    discountComment: string;
    name?: string;
  }[];
}

export interface IStundets {
  data: Omit<IStudent, "groups">[];
  limit: number;
  page: number;
  total: number;
}

export type ICreateStudent = Partial<
  Omit<IStudent, "id" | "balance" | "courses" | "status" | "disability">
> & {
  leadId?: number;
  disability?: string;
};

export type OneStudentType = Partial<IStudent> & {
  bonuses: IBonus[];
  transactions: ITransaction[];
  groupStudents: IInGroupStudent[];
  lessons: IEditLesson[];
};

export type OneStudentTypeResponce = Partial<IStudent> & {
  bonuses: IBonus[];
  transactions: ITransaction[];
  groupStudents: IInGroupStudent[];
  lessons: ILesson[];
};
