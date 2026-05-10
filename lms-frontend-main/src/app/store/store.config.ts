import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import { reducer } from "./reducer";
import { authApi } from "./services/auth.sevice";
import { userApi } from "./services/user.service";
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
import { leedsKanbanApi } from "./services/leeds-kanban.service";
import { tasksApi } from "./services/tasks.service";
import { paymentPlansApi } from "./services/payment-plans.service";
import { homeworkApi } from "./services/homework.service";
import { dashboardApi } from "./services/dashboard.service";
import { debtorsApi } from "./services/debtors.service";
import { reportsApi } from "./services/reports.service";
import { telegramApi } from "./services/telegram.service";
import { notificationTemplatesApi } from "./services/notification-templates.service";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authState", "userState"],
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      userApi.middleware,
      branchApi.middleware,
      courseApi.middleware,
      groupApi.middleware,
      mentorApi.middleware,
      scheduleApi.middleware,
      studentAPI.middleware,
      leedApi.middleware,
      fineApi.middleware,
      bonusApi.middleware,
      lessonsApi.middleware,
      accountingApi.middleware,
      testApi.middleware,
      imageApi.middleware,
      leedsKanbanApi.middleware,
      tasksApi.middleware,
      paymentPlansApi.middleware,
      homeworkApi.middleware,
      dashboardApi.middleware,
      debtorsApi.middleware,
      reportsApi.middleware,
      telegramApi.middleware,
      notificationTemplatesApi.middleware
    );
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
