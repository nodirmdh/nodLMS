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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input.tsx";
import { useTranslation } from "react-i18next";
import { addThirtyMinutes, generateTimeArray } from "@/lib/utils.ts";
import { format } from "date-fns";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetResponsiblesSelectQuery } from "@/app/store/services/user.service";
import { IOneLessonPost } from "@/app/store/services/lessons.service";
import { profileFormSchema } from "./schema";

type ProfileFormValues = z.infer<typeof profileFormSchema>;
interface ILesson {
  submitForm: (values: IOneLessonPost) => Promise<any>;
  isLoading: boolean;
  closeModal: () => void;
  refetch: () => void;
}
// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  startTime: "08:00",
  endTime: "08:30",
};

export const CreateLessonForm: FC<ILesson> = ({
  submitForm,
  isLoading,
  closeModal,
  refetch,
}) => {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const responsible = useGetResponsiblesSelectQuery();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    const date = new Date(data.date);
    const formattedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    formattedDate.setHours(0, 0, 0, 0);

    let newData = {
      ...data,
      responsibleId: parseInt(data.responsibleId),
      date: formattedDate,
    };

    submitForm(newData)
      .then(() => {
        refetch();
        closeModal();
        toast({
          title: t("success", { ns: "common" }),
          description: ``,
        });
      })
      .catch(() => {});
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("nameHead")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className={"grid gap-2"}>
              <FormLabel>{t("date", { ns: "student" })}</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{t("pickdate", { ns: "groups" })}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-10">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="responsibleId"
          render={({ field }) => (
            <FormItem className={"grid gap-2 grow"}>
              <FormLabel>{t("responsibleId", { ns: "student" })}</FormLabel>
              <FormControl>
                <SelectRedy
                  field={field}
                  options={responsible.data ? responsible.data : []}
                  placeholder={t("selectResponsible", { ns: "student" })}
                  namespace={"staff"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("startLesson")}</FormLabel>
              <Select
                onValueChange={(value) => {
                  form.setValue("endTime", addThirtyMinutes(value));
                  field.onChange(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Укажите время начало урока" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {generateTimeArray("08:00", "22:00").map((hour) => (
                    <SelectItem value={hour}>{hour}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("endTime", { ns: "groups" })}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Укажите время закончание урока" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {generateTimeArray(
                    addThirtyMinutes(form.getValues("startTime")),
                    "22:30"
                  ).map((hour) => (
                    <SelectItem value={hour}>{hour}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {t("add")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
