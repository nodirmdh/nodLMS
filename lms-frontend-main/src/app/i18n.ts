import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "@/common/locales/en";
import { ru } from "@/common/locales/ru";
import { qq } from "@/common/locales/qq";
import { uzLat } from "@/common/locales/uzLat";
import { uzKir } from "@/common/locales/uzKir";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const local = JSON.parse(localStorage.getItem("persist:root"));
const langPersist =
  local && local.userState ? JSON.parse(local.userState).lang : "ru";

i18n.use(initReactI18next).init({
  resources: {
    en,
    ru,
    qq,
    uzLat,
    uzKir,
  },
  fallbackLng: langPersist,
  interpolation: {
    escapeValue: false,
  },
});
