import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FC, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { addThirtyMinutes, generateTimeArray } from "@/lib/utils.ts";
import { format } from "date-fns";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMentorsSelectQuery } from "@/app/store/services/mentor.service";
import { lessonStatusSchema } from "./schema";
type ProfileFormValues = z.infer<typeof lessonStatusSchema>;
interface ILesson {
  submitForm: (values: { data: any; id: string }) => Promise<any>;
  isLoading: boolean;
  setModal: () => void;
  id: string | undefined;
  defoutTime: { startTime: string; endTime: string };
  inivateValue: any;
}

export const StatusLessonForm: FC<ILesson> = ({
  submitForm,
  isLoading,
  setModal,
  id,
  defoutTime,
  inivateValue,
}) => {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const [statusChesk, setStatusChesk] = useState<string>(
    inivateValue.status ? inivateValue.status : ""
  );
  const mentors = useGetMentorsSelectQuery({});
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(lessonStatusSchema),
    //@ts-ignore
    defoutTime,

    defaultValues: inivateValue,
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    if (data.date) {
      const date = new Date(data.date);

      // Vaqtni UTC formatiga o'tkazish
      const utcDate = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds()
        )
      );

      // ISO formatda UTC vaqtni olish
      data.date = utcDate; // "2024-09-14T00:00:00.000Z"
    }

    if (id) {
      let newData = { ...data, mentorId: parseInt(data.mentorId || "") };
      submitForm({ data: newData, id: id })
        .then(() => {
          setModal();
          toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        })
        .catch(() => {});
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("status")}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setStatusChesk(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("status")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={"waiting"}>
                      {t("waiting", { ns: "status" })}
                    </SelectItem>
                    <SelectItem value={"cancelled"}>
                      {t("cancelled", { ns: "status" })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mentorId"
          render={({ field }) => (
            <FormItem className={"grid gap-2 grow"}>
              <FormLabel>{t("mentor", { ns: "groups" })}</FormLabel>
              <FormControl>
                <SelectRedy
                  field={field}
                  options={mentors.data ? mentors.data : []}
                  placeholder={t("mentorSelect", { ns: "groups" })}
                  namespace={"staff"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {statusChesk === "waiting" && (
          <>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                return (
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
                            selected={
                              new Date(field.value ? field.value : new Date())
                            }
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
                        <SelectValue
                          placeholder={t("startTime", { ns: "lessons" })}
                        />
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
                        <SelectValue
                          placeholder={t("endTime", { ns: "lessons" })}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {generateTimeArray(
                        addThirtyMinutes(
                          //@ts-ignore
                          form.getValues("startTime")
                            ? form.getValues("startTime")
                            : "8:00"
                        ),
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
          </>
        )}

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
            type="button"
            onClick={() => setModal()}
            className="w-1/2"
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
            {t("update", { ns: "lessons" })}
          </Button>
        </div>
      </form>
    </Form>
  );
};
