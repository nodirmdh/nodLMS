import { RouterProvider } from "react-router-dom";
import type { Router } from "@remix-run/router/dist/router";
import { Provider } from "react-redux";
import { persistor, store } from "@/app/store";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "@/components/ui/toaster.tsx";

type Props = {
  router: Router;
};

export const Providers = ({ router }: Props) => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <RouterProvider router={router} />
      <Toaster />
    </PersistGate>
  </Provider>
);
