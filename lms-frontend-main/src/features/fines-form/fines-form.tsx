import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { confirmfines } from "./schema";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useGetUsersSelectQuery } from "@/app/store/services/user.service";
import { ButtonLoading } from "@/components/ui/loading-button";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
import { IPostBonus } from "@/common/types/bonus-fines.interface";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatAmount, formatNumber } from "@/lib/utils";
import { Combobox } from "@/components/comebox/comebox";
import { Textarea } from "@/components/ui/textarea";
interface LeedFormProps {
  type: "CREATE" | "UPDATE";
  formType: "FINE" | "BONUS";
  initialValues: any;
  submitForm: (value: IPostBonus) => Promise<any>;
  isLoading: boolean;
}

export const FineForm = ({
  type,
  initialValues,
  submitForm,
  isLoading,
  formType,
}: LeedFormProps) => {
  const { t } = useTranslation(formType === "FINE" ? ["fine"] : ["bonus"]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data } = useGetUsersSelectQuery();
  const { id } = useSelector((state: RootState) => state.userState);

  const form = useForm<z.infer<typeof confirmfines>>({
    resolver: zodResolver(confirmfines),
    values: initialValues,
  });

  const onSubmit = (values: z.infer<typeof confirmfines>) => {
    const today = new Date();
    let newData = {
      ...values,
      authorId: id,
      date: today,
      userId: parseInt(values.userId),
      amount: parseInt(formatNumber(values.amount)),
    };
    submitForm(newData)
      .then((res) => {
        if (res.data.id || res.data.title) {
          formType === "FINE" ? navigate("/fines") : navigate("/bonuses");
          return toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
      })
      .catch(() =>
        toast({
          title: t("error", { ns: "common" }),
          description: ``,
          variant: "destructive",
        })
      );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl">{t(type)}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4">
              {data && (
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem className={"grid gap-2 grow"}>
                      <FormLabel>{t("user", { ns: "fine" })}</FormLabel>
                      <FormControl>
                        {data ? (
                          <Combobox
                            className="w-full"
                            selected={field.value ? field.value : ""}
                            onChange={field.onChange}
                            options={data?.length > 0 ? data : []}
                            placeholder={t("selectStaffs", { ns: "fines" })}
                          />
                        ) : (
                          ""
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className={"grid gap-2"}>
                    <FormLabel>{t("name", { ns: "fine" })}</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className={"grid gap-2"}>
                    <FormLabel>{t("amount", { ns: "fine" })}</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value}
                        onChange={(event: any) => {
                          const newValue = event.target.value.replace(
                            /\s+/g,
                            ""
                          );
                          if (/^\d*$/.test(newValue)) {
                            field.onChange(formatAmount(newValue));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className={"grid gap-2"}>
                    <FormLabel>{t("comment", { ns: "common" })}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-4 mt-4">
              <Button
                className="w-1/2"
                variant="outline"
                type="button"
                size="sm"
                onClick={() => navigate(-1)}
              >
                {t("cancel", { ns: "common" })}
              </Button>
              <ButtonLoading isLoading={isLoading} className="w-1/2" size="sm">
                {t(type)}
              </ButtonLoading>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
