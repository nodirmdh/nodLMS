import { ITransaction } from "./transaction.interface";
import { IBonus } from "./bonus-fines.interface";

interface IBranch {
  id: number;
  name: string;
  address: string;
}

export interface IUser {
  id: number;
  fio: string;
  phone: string;
  phoneSecond?: string;
  documentSeries?: string;
  documentNo?: string;
  role: string[];
  salaryMentorType?: string;
  salaryMentor?: number | string;
  salary?: number | string;
  lang?: string;
  branches: IBranch[];
  telegram?: string;
  birthday?: string;
  socialStatus?: string;
  education?: string;
  familyStatus?: string;
  address: string;
  cardNo?: string;
  cardPlaceholder?: string;
  avatar: string;
  status?: string;
  sex?: string;
  branch?: number;
  email?: string;
  balance: number;
  availableBalance: number;
  acceptedBalance: number;
  paymentBalance?: number;
  bonusesReceived?: IBonus[];
  finesReceived?: ITransaction[];
  transactions?: ITransaction[];
  authorTransactions: ITransaction[];
}

export type IUsers = Omit<
  IUser,
  "bonusesReceived" | "finesReceived" | "transactions" | "authorTransactions"
>[];

export type IUserCreate = Partial<
  Omit<
    IUser,
    | "bonusesReceived"
    | "finesReceived"
    | "transactions"
    | "authorTransactions"
    | "id"
    | "branches"
    | "email"
    | "balance"
    | "availableBalance"
    | "paymentBalance"
    | "acceptedBalance"
  >
> & {
  branches: number[];
};

export type UserCreateMessage = Partial<IUserCreate> & {
  clientVersion: string;
  code: string;
  meta: { modelName: string; target: null };
  name: string;
};

export interface IUsersGetProp {
  filter: string;
  search: string;
}

export type SelectType = {
  value: string;
  label: string;
}[];

export type IUserType = Omit<
  IUser,
  "bonusesReceived" | "finesReceived" | "transactions" | "authorTransactions"
>;

export type IUserMe = Partial<IUserType> & {
  mentorId: number;
  branches: IBranch[];
};

export interface IPostFillal {
  id: number;
  data: { branch: number; lang: string };
}

export type IUpdateUser = Partial<IUserCreate> & {
  id: number;
};
