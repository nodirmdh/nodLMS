import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "./services/auth.sevice";
import { userApi } from "./services/user.service";
import authReducer from "./features/auth.feature";
import userReducer from "./features/user.feature";
import { branchApi } from "./services/branch.service";
import { courseApi } from "./services/course.service";
import { groupApi } from "./services/groups.service";
import { mentorApi } from "./services/mentor.service";
import { scheduleApi } from "./services/schedule.service";
import { studentAPI } from "./services/student.service";
import { leedApi } from "./services/leeds.service";
import { fineApi } from "./services/fines.service";
import { bonusApi } from "./services/bonuses.service";
import { lessonsApi } from "./services/lessons.service";
import { accountingApi } from "./services/accounting.service";
import { testApi } from "./services/test.service";
import { imageApi } from "./services/image.service";
export const reducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [branchApi.reducerPath]: branchApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [groupApi.reducerPath]: groupApi.reducer,
  [mentorApi.reducerPath]: mentorApi.reducer,
  [scheduleApi.reducerPath]: scheduleApi.reducer,
  [studentAPI.reducerPath]: studentAPI.reducer,
  [leedApi.reducerPath]: leedApi.reducer,
  [fineApi.reducerPath]: fineApi.reducer,
  [bonusApi.reducerPath]: bonusApi.reducer,
  [lessonsApi.reducerPath]: lessonsApi.reducer,
  [accountingApi.reducerPath]: accountingApi.reducer,
  [testApi.reducerPath]: testApi.reducer,
  [imageApi.reducerPath]: imageApi.reducer,
  authState: authReducer,
  userState: userReducer,
});
