import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import SendSms from "./send-sms";
interface ITimer {
  phone: string | null;
  secoundtime: number;
  seconds: number;
  secoundFunc: (sec: number) => void
}
export const Timer: React.FC<ITimer> = ({
  phone,
  secoundtime,
  seconds,
  secoundFunc,
}) => {
  const { t } = useTranslation(["auth"]);

  useEffect(() => {
    if (seconds > 0) {
      const timerId = setTimeout(() => secoundFunc(seconds - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
    }
  }, [seconds]);

  return (
    <div>
      {seconds > 0 ? (
        
        <p>{t("timer", { seconds })}</p>
      ) : (
        <SendSms phone={phone} seconds={secoundtime} secoundFunc={secoundFunc} />
      )}
    </div>
  );
};


