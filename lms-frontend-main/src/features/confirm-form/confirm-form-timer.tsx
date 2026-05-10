import { useState } from "react";
import { CardHeader } from "@/components/ui/card";
import { Timer } from "@/components/Timer";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const ConfirmFormTimer = ({
  phone,
  form,
  isLoading,
}: {
  isLoading: boolean;
  phone: string | null;
  form: UseFormReturn<
    {
      code: string;
    },
    any,
    undefined
  >;
}) => {
  const { t } = useTranslation("auth");

  const navigate = useNavigate();

  const secoundtime = 60;

  const [seconds, setSeconds] = useState(secoundtime);
  const secoundFunc = (sec: number) => {
    setSeconds(sec);
  };
  return (
    <>
      <CardHeader>
        <Timer
          phone={phone}
          seconds={seconds}
          secoundtime={secoundtime}
          secoundFunc={secoundFunc}
        />
      </CardHeader>
      <CardFooter className="gap-2">
        <Button
          variant="outline"
          className="w-1/2"
          onClick={() => navigate("/auth")}
        >
          {t("cancel", {ns:'common'})}
        </Button>
        <Button
          type={"submit"}
          className="w-1/2"
          disabled={
            !Boolean(form.getValues("code")) || isLoading || seconds === 0
          }
        >
          {t("confirm", { ns: "common" })}
        </Button>
      </CardFooter>
    </>
  );
};
