import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/loading-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select as SelectUI,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exprenceSchema } from "./schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Combobox } from "@/components/comebox/comebox";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { formatAmount } from "@/lib/utils";
import { FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/select";
import { useGetUsersSelectQuery } from "@/app/store/services/user.service";
import { formatNumber } from "@/lib/utils";
import { RootState } from "@/app/store/store.config";

interface IPost {
  type: string;
  amount: string;
  comment?: string | undefined;
  paymentType?: string | undefined;
  studentId?: string | undefined;
  userId?: string | undefined;
  expenseType?: string | undefined;
  profitType?: string | undefined;
}
interface IProps {
  type: "create" | "update";
  initialValues: IPost;
  submitForm: (value: any) => Promise<any>;
  isLoading: boolean;
  student?: any;
}
const ExprenceForm: FC<IProps> = ({
  initialValues,
  submitForm,
  isLoading,
  type,
  student,
}) => {
  const authorId = useSelector((state: RootState) => state.userState.id);
  const navigate = useNavigate();
  const { t } = useTranslation("group");
  const { toast } = useToast();
  const staffs = useGetUsersSelectQuery();
  const [selectType, setSelectType] = useState<string>(
    initialValues.type ? initialValues.type : ""
  );
  const selectPaymentType = student?.id ? "payment" : "other";
  const [expenseType, setExpenseType] = useState<string | null>(
    initialValues.expenseType ? initialValues.expenseType : null
  );
  const form = useForm<z.infer<typeof exprenceSchema>>({
    resolver: zodResolver(exprenceSchema),
    values: initialValues,
  });

  const onSubmit = (values: z.infer<typeof exprenceSchema>) => {
    const today = new Date();
    let newData = {
      ...values,
      type: selectType,
      expenseType: expenseType,
      amount: parseInt(formatNumber(values.amount)),
      userId: parseInt(values.userId ? values.userId : ""),
      studentId: parseInt(values.studentId ? values.studentId : ""),
      authorId: authorId,
      date: today,
      profitType: selectPaymentType,
    };

    submitForm(newData)
      .then((res) => {
        if (res.data.id) {
          navigate("/accounting");
          return toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
      })
      .catch(() => {
        toast({
          title: t("error", { ns: "common" }),
          description: ``,
          variant: "destructive",
        });
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t(type, { ns: "accounting" })}
              <br />
              {student?.fio}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormLabel>{t("type", { ns: "list" })}</FormLabel>
            <FormControl>
              <SelectUI
                onValueChange={(el) => setSelectType(el)}
                defaultValue={selectType}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder={t("type", { ns: "list" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={"in"}>
                      {t("in", { ns: "accounting" })}
                    </SelectItem>
                    <SelectItem value={"out"}>
                      {t("out", { ns: "accounting" })}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </SelectUI>
            </FormControl>

            {selectType === "in" && (
              <>
                {selectPaymentType && (
                  <>
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => {
                        return (
                          <FormItem className={"grid gap-2"}>
                            <FormLabel>
                              {t("amount", { ns: "accounting" })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                value={field.value}
                                required
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
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => {
                        return (
                          <FormItem className={"grid gap-2"}>
                            <FormLabel>{t("comment")}</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2"}>
                          <FormLabel>
                            {t("paymentType", { ns: "accounting" })}
                          </FormLabel>
                          <FormControl>
                            <Select
                              options={[
                                {
                                  label: t("cash", { ns: "accounting" }),
                                  value: "cash",
                                },

                                {
                                  label: t("click", { ns: "accounting" }),
                                  value: "click",
                                },
                                {
                                  label: t("card", { ns: "accounting" }),
                                  value: "card",
                                },
                                {
                                  label: t("transfer", { ns: "accounting" }),
                                  value: "transfer",
                                },
                              ]}
                              field={field}
                              namespace="paymentType"
                              placeholder={t("paymentType", {
                                ns: "accounting",
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {student?.id && (
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem className={"w-full"}>
                        <FormLabel>
                          {t("userId", { ns: "accounting" })}
                        </FormLabel>
                        <FormControl>
                          {staffs.data ? (
                            <Combobox
                              className="w-full"
                              selected={field.value ? field.value : ""}
                              onChange={field.onChange}
                              options={
                                staffs.data?.length > 0 ? staffs.data : []
                              }
                              placeholder={t("userId", { ns: "accounting" })}
                            />
                          ) : (
                            ""
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {selectType === "out" && (
              <>
                <FormLabel>{t("selectType", { ns: "accounting" })}</FormLabel>
                <FormControl>
                  <SelectUI
                    onValueChange={(el) => setExpenseType(el)}
                    defaultValue={expenseType ? expenseType : ""}
                  >
                    <SelectTrigger className="">
                      <SelectValue
                        placeholder={t("type", { ns: "accounting" })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={"salary"}>
                          {t("salary", { ns: "accounting" })}
                        </SelectItem>
                        <SelectItem value={"rent"}>
                          {t("rent", { ns: "accounting" })}
                        </SelectItem>
                        <SelectItem value={"communal"}>
                          {t("communal", { ns: "accounting" })}
                        </SelectItem>
                        <SelectItem value={"other"}>
                          {t("other", { ns: "accounting" })}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </SelectUI>
                </FormControl>
                {expenseType === "salary" && (
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem className={"w-full"}>
                        <FormLabel>
                          {t("userId", { ns: "accounting" })}
                        </FormLabel>
                        <FormControl>
                          {staffs.data ? (
                            <Combobox
                              className="w-full"
                              selected={field.value ? field.value : ""}
                              onChange={field.onChange}
                              options={
                                staffs.data?.length > 0 ? staffs.data : []
                              }
                              placeholder={t("userId", { ns: "accounting" })}
                            />
                          ) : (
                            ""
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                {expenseType && (
                  <>
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => {
                        return (
                          <FormItem className={"grid gap-2"}>
                            <FormLabel>
                              {t("amount", { ns: "accounting" })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                value={field.value}
                                required
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
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2"}>
                          <FormLabel>
                            {t("paymentType", { ns: "accounting" })}
                          </FormLabel>
                          <FormControl>
                            <Select
                              options={[
                                {
                                  label: t("cash", { ns: "accounting" }),
                                  value: "cash",
                                },

                                {
                                  label: t("click", { ns: "accounting" }),
                                  value: "click",
                                },
                                {
                                  label: t("card", { ns: "accounting" }),
                                  value: "card",
                                },
                                {
                                  label: t("transfer", { ns: "accounting" }),
                                  value: "transfer",
                                },
                              ]}
                              field={field}
                              namespace="paymentType"
                              placeholder={t("paymentType", {
                                ns: "accounting",
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => {
                        return (
                          <FormItem className={"grid gap-2"}>
                            <FormLabel>
                              {t("comment", { ns: "accounting" })}
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </>
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex mt-4 w-full gap-10">
              <Button
                onClick={() => navigate(-1)}
                className="w-full"
                variant="outline"
                type="button"
              >
                {t("cancel", { ns: "common" })}
              </Button>
              <ButtonLoading isLoading={isLoading} className="w-1/2">
                {t(type, { ns: "common" })}
              </ButtonLoading>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export { ExprenceForm };
