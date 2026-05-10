import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  authenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  authenticated: false,
  token: "",
};

export const authState = createSlice({
  initialState,
  name: "authState",
  reducers: {
    setAuth: (state, action) => {
      state.authenticated = true;
      state.token = action.payload;
    },
    resetAuth: () => initialState,
  },
});

export default authState.reducer;

export const { setAuth, resetAuth } = authState.actions;
