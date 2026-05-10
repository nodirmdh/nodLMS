export interface AuthBody {
  phone: string;
}

export interface ConfirmBody {
  phone: string;
  code: string;
}

export interface LoginResponse {
  status: string;
}

export interface ConfirmResponse {
  token: string;
}
