import { IUserType } from "./user.interface";

export interface IBonus {
  amount: number;
  author: IUserType;
  authorId: number;
  comment: string;
  date: string;
  id: number;
  name: string;
  user: IUserType;
  userId: number;
}

export interface IBonusesResponce {
  data: IBonus[];
  limit: number;
  page: number;
  total: number;
}

export interface IBonuses {
  data: Partial<Omit<IBonus, "author" | "user">> &
    {
      author: string;
      user: string;
    }[];
  limit: number;
  page: number;
  total: number;
}

export interface IPostBonus {
  name: string;
  userId: number;
  authorId: number;
  date: Date;
  amount: number;
  comment?: string;
}

export interface IUpDateBonus {
  data: IPostBonus;
  id: string;
}

export interface IBonusProp {
  filter: string;
  page: number;
}

export type IBonusPostMessage = Partial<IBonus> & {
  message: string;
  statusCode: number;
};
