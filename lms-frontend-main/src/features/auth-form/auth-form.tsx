import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { authSchema } from "@/features/auth-form/schema";
import { useLoginMutation } from "@/app/store/services/auth.sevice";
import { useNavigate } from "react-router-dom";
import { setPhone } from "@/app/store/features/user.feature";
import { useAppDispatch } from "@/app/store/store.config";
import { MaskedField } from "@/components/masked-field";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
export const AuthForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {toast}=useToast()
  const { t } = useTranslation(["auth"]);
  const [login, { isLoading,error }] = useLoginMutation();
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      phone: "",
    },
  });
useEffect(()=>{
    if(error){
      form.reset();
    toast({
      title: t("bazaNotNumber"),
      description: "",
      variant: "destructive",
    })
  }
},[error])

  const onSubmit = (values: z.infer<typeof authSchema>) =>
    login(values)
      .then((res) => {
        // @ts-ignore
        if (res?.data?.message === "success") {
          dispatch(setPhone(values.phone));
          navigate("/auth/confirm");
        }
      })
      .catch(() =>
        toast({
          title: t("error", { ns: "common" }),
          description: ``,
          variant: "destructive",
        })
      );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-[min(100%-30px,650px)] m-auto w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("descriptionPhone")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("phone")}</FormLabel>
                  <FormControl>
                    <MaskedField value={field.value} onInput={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type={"submit"}
              className="w-full text-white"
              disabled={!Boolean(form.getValues("phone")) || isLoading}
            >
              {t("phoneBtn")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
