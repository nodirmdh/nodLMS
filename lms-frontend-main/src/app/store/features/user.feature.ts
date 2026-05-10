import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  id: number;
  phone: string | null;
  lang: string;
  branch: number | null;
  role:string[]
}

const initialState: UserState = {
  id: 0,
  phone: null,
  lang: "ru",
  branch: null,
  role:[]
};

export const userState = createSlice({
  initialState,
  name: "userState",
  reducers: {
    setPhone: (state, action) => {
      state.phone = action.payload;
    },
    changeBranch: (state, action) => {
      state.branch = action.payload;
    },
    changeLanguage: (state, action) => {
      state.lang = action.payload;
    },
    setUser: (_state, action) => {
      return action.payload;
    },
    logout: () => initialState,
  },
});

export default userState.reducer;

export const { setPhone, logout, changeBranch, changeLanguage, setUser } =
  userState.actions;
