import { IUserType } from "./user.interface";
import { IStudent } from "./students.interface";

export interface ITransaction {
  amount: number;
  authorId: number;
  comment: string;
  date: Date;
  expenseType?: string;
  id: number;
  paymentType: string;
  profitType: string;
  studentId: number;
  type: string;
  userId: string;
}

export interface ITransactions {
  data: ITransaction[];
  total: number;
  page: number;
  limit: number;
  in: number;
  out: null | number;
  balance: number;
}

export type IOneTransaction = Partial<ITransaction> & {
  author: IUserType;
  user: IUserType;
  student: IStudent;
};

export type IPostTransaction = Omit<ITransaction, "id" | "date" | "authorId">;

export type IDeptors = IStudent[];

export type ISendSMSDeptors = {
  id: number;
  fio: string;
  phone: string;
  balance: number;
  sendSms: boolean;
  motherPhone: string;
  fatherPhone: string;
}[];

export interface ISendSMSDeptorsMessage {
  success: boolean;
  totalMessagesSent: number;
}

export interface ICreateTransaction {
  message: string;
  statusCode: number;
  amount: number;
  authorId: number;
  comment: string;
  date: Date;
  expenseType?: string;
  id: number;
  paymentType: string;
  profitType: string;
  studentId: number;
  type: string;
  userId: string;
}

export interface IUpDateTransaction {
  id: string;
  data: IPostTransaction;
}

export interface IPropGetTransaction {
  value: string;
  page: number;
  filter: string;
}
