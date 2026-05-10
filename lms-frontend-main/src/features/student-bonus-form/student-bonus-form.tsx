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
  studentId: string;
  defaultValues: {
    amount: string;
    comment: string;
    studentId: number;
  };
  isLoading: boolean;
  closeModal: () => void;
  fio: string;
  refetch: () => void;
  mentors: { value: string; label: string }[] | undefined;
}

export const StudentBonusForm: FC<ILesson> = ({
  submitForm,
  isLoading,
  closeModal,
  defaultValues,
  studentId,
  fio,
  refetch,
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
      data: {
        ...data,
        date: new Date(),
        amount: parseInt(formatNumber(data.amount)),
        userId: data.userId ? parseInt(data.userId) : null,
      },
      id: studentId,
    })
      .then((res: any) => {
        if (res.data.id) {
          toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
          refetch();
        }
        toast({
          title: t("success", { ns: "common" }),
          description: ``,
        });
        closeModal();
      })
      .catch(() => {
        toast({
          title: t("error", { ns: "common" }),
          description: ``,
        });
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className=" text-center text-sm md:text-base font-bold">
          {t("bonus", { ns: "bonus" })}{" "}
        </h2>
        <h2 className=" text-center text-sm md:text-base font-bold">{fio}</h2>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name", { ns: "fine" })}</FormLabel>
              <FormControl>
                <Input className="resize-none" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

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
          name="userId"
          render={({ field }) => (
            <FormItem className={"grid gap-2 grow"}>
              <FormLabel>{t("mentor", { ns: "mentor" })}</FormLabel>
              <FormControl>
                <Combobox
                  className="w-full"
                  selected={field.value ? field.value : ""}
                  onChange={field.onChange}
                  options={mentors ? (mentors.length > 0 ? mentors : []) : []}
                  placeholder={t("mentorSelect", { ns: "groups" })}
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
