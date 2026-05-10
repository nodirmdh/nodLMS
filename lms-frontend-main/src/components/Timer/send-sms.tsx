import React from "react";
import { useNewsmsMutation } from "@/app/store/services/auth.sevice";
import { useTranslation } from "react-i18next";
// import { useDispatch } from "react-redux";

interface ISendSms {
  phone: string | null;
  seconds: number;
  secoundFunc: (sec: number) => void;
}
const SendSms: React.FC<ISendSms> = ({ phone, seconds, secoundFunc }) => {
  const { t } = useTranslation("auth");
  const [newsmsMutation, {}] = useNewsmsMutation();
  //   const dispatch=useDispatch()
  const restartAuth = () => {
    if (phone) {
      newsmsMutation({ phone: phone })
        .then((res) => {
          // @ts-ignore
          if (res?.data?.message === "success") {
            secoundFunc(seconds);
            //   dispatch(setAuth(res.data.token));
          }
        })
        .catch();
    }
  };
  return (
    <button
      type="button"
      className="border-0 bg-transparent text-red-500 text-[17px] text-left"
      onClick={restartAuth}
    >
      {t("endtime")}
    </button>
  );
};

export default React.memo(SendSms);
