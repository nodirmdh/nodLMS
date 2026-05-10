import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmSchema } from "./schema";
import { useNavigate } from "react-router-dom";
import { useConfirmMutation } from "@/app/store/services/auth.sevice";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmFormTimer } from "./confirm-form-timer";
export const ConfirmForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { toast } = useToast();
  const phone = useSelector((state: RootState) => state.userState.phone);

  const [confirm, { isLoading, error }] = useConfirmMutation();

  const form = useForm<z.infer<typeof confirmSchema>>({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (!phone) {
      navigate("/auth");
    }
  }, []);

  useEffect(() => {
    if (error) {
      form.reset();
      toast({
        title: t("errormessage"),
        description: "",
        variant: "destructive",
      });
    }
  }, [error]);

  const onSubmit = (values: z.infer<typeof confirmSchema>) => {
    if (phone) {
      confirm({ ...values, phone })
        .then((res: any) => {
          if (res.data) {
            return navigate("/");
          }
        })
        .catch(() => {
          toast({
            title: t("errorCode", { ns: "common" }),
            description: '',
            variant: "destructive",
          });
        });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
        }}
      >
        <Card className="w-[min(100%-20px,600px)] m-auto w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("descriptionSMS")}</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 justify-center">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("code")}</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <ConfirmFormTimer phone={phone} form={form} isLoading={isLoading} />
        </Card>
      </form>
    </Form>
  );
};
