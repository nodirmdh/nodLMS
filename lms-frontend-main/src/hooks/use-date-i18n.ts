import { useTranslation } from "react-i18next";

export const useDateI18n = () => {
  const { t } = useTranslation("month");

  const get18nDate = (date: string) => {
    return `${date.slice(0, 2)} ${t(date.slice(2, 6).toString().trim())} ${date.slice(6)}`;
  };

  return { get18nDate };
};
