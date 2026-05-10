import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select as SelectRedy } from "@/components/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input.tsx";
import { useTranslation } from "react-i18next";
import { formatAmount, formatNumber } from "@/lib/utils.ts";
import { exprenceSchema } from "./schema";
import { Combobox } from "@/components/comebox/comebox";

type ProfileFormValues = z.infer<typeof exprenceSchema>;
interface ILesson {
  submitForm: (values: any) => Promise<any>;
  defaultValues: {
    type: string;
    amount: string;
    comment: string;
    paymentType: string;
    studentId: number;
    profitType: string;
  };
  isLoading: boolean;
  closeModal: () => void;
  refetch: () => void;
  fio: string;
  mentors: { label: string; value: string }[] | undefined;
}

export const StudentTrasactionForm: FC<ILesson> = ({
  submitForm,
  isLoading,
  closeModal,
  refetch,
  defaultValues,
  fio,
  mentors,
}) => {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(exprenceSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    submitForm({
      ...data,
      date: new Date(),
      amount: parseInt(formatNumber(data.amount)),
      userId:data.userId?parseInt(data.userId):null
    })
      .then((res: any) => {
        if (res.data.id) {
          toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
        refetch();
        closeModal();
      })
      .catch(() => {});
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <h2 className=" text-center text-sm md:text-base font-bold">{fio}</h2>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className={"grid gap-2"}>
              <FormLabel>{t("amount", { ns: "accounting" })}</FormLabel>
              <FormControl>
                <Input
                  value={formatAmount(field.value)}
                  onChange={(event: any) => {
                    const newValue = event.target.value.replace(/\s+/g, "");
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
          name="paymentType"
          render={({ field }) => (
            <FormItem className={"grid gap-2"}>
              <FormLabel>{t("paymentType", { ns: "accounting" })}</FormLabel>
              <FormControl>
                <SelectRedy
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
          name="userId"
          render={({ field }) => (
            <FormItem className={"w-full"}>
              <FormLabel>{t("mentor", { ns: "mentor" })}</FormLabel>
              <FormControl>
                <Combobox
                  className="w-full"
                  selected={field.value ? field.value : ""}
                  onChange={field.onChange}
                  options={mentors ? (mentors.length > 0 ? mentors : []) : []}
                  placeholder={t("mentor", { ns: "mentor" })}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("comment")}</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            className="w-1/2"
            type="button"
            onClick={closeModal}
            size="sm"
          >
            {t("cancel")}
          </Button>
          <Button
            disabled={isLoading}
            className="w-1/2"
            type="submit"
            size="sm"
          >
            {t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
