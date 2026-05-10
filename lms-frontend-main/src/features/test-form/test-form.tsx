import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { testSchema } from "./schema";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  useGetSelectGroupsMutation,
} from "@/app/store/services/groups.service";
import { useGetUsersSelectQuery } from "@/app/store/services/user.service";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/loading-button";
import { Combobox } from "@/components/comebox/comebox";
import { IPostExam } from "@/app/store/services/test.service";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/multi-select";
import { useEffect, useState } from "react";
interface LeedFormProps {
  type: "CREATE" | "UPDATE";
  initialValues: {
    name: string;
    date: Date;
    groupId: string;
    responsibleId: string;
    comments?: string;
  };
  submitForm: (value: IPostExam) => Promise<any>;
  isLoading: boolean;
  grouptype:(string|number)[]
}
export const TestForm = ({
  type,
  initialValues,
  submitForm,
  isLoading,
  grouptype
}: LeedFormProps) => {
  const { t } = useTranslation("group");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<(string | number)[]>(grouptype?grouptype:[]);
  const [groupPost, groups] = useGetSelectGroupsMutation();
  const users = useGetUsersSelectQuery();
  const form = useForm<z.infer<typeof testSchema>>({
    resolver: zodResolver(testSchema),
    defaultValues: initialValues,
  });
  const onSubmit = (values: z.infer<typeof testSchema>) => {
    submitForm({
      ...values,
      groupId: parseInt(values.groupId),
      responsibleId: parseInt(values.responsibleId),
    })
      .then((res: { data: { id: number; title: string } }) => {
        if (res.data.id || res.data.title) {
          navigate(-1);
          return toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
      })
      .catch((res) => {
        if (res) {
          toast({
            title: t("error", { ns: "common" }),
            description: ``,
            variant: "destructive",
          });
        }
      });
  };
  useEffect(() => {
    if (statuses) {
      groupPost({ statuses });
    }
  }, [statuses]);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t(type, { ns: "exams" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 grow"}>
                    <FormLabel>{t("testname", { ns: "mentor" })}</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className={"grid gap-2"}>
                    <FormLabel>{t("date", { ns: "fine" })}</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal px-2",
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
              <p className="font-bold text-sm">{t("groupStatus", { ns: "status" })}</p>
              <MultiSelect
                options={[
                  {
                    value: "waiting",
                    label: t("waiting", { ns: "status" }),
                  },
                  {
                    value: "active",
                    label: t("active", { ns: "status" }),
                  },
                  {
                    value: "frozen",
                    label: t("frozen", { ns: "status" }),
                  },
                  {
                    value: "completed",
                    label: t("completed", { ns: "status" }),
                  },
                ]}
                onValueChange={(values) => {
                  setStatuses(values);
                }}
                defaultValue={statuses}
                placeholder={t("selectStatus", { ns: "mentor" })}
                variant="inverted"
                animation={1}
                maxCount={5}
                name={"role"}
              />

              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem className={"grid gap-2"}>
                    <FormLabel>{t("groupId", { ns: "role" })}</FormLabel>
                    <FormControl>
                      {groups.data ? (
                        <Combobox
                          className="w-full"
                          selected={field.value ? field.value : ""}
                          onChange={field.onChange}
                          options={groups.data?.length > 0 ? groups.data : []}
                          placeholder={t("selectGroups", { ns: "mentor" })}
                        />
                      ) : (
                        ""
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsibleId"
                render={({ field }) => (
                  <FormItem className={"grid gap-2"}>
                    <FormLabel>{t("responsible", { ns: "group" })}</FormLabel>
                    <FormControl>
                      {users.data ? (
                        <Combobox
                          className="w-full"
                          selected={field.value ? field.value : ""}
                          onChange={field.onChange}
                          options={users.data?.length > 0 ? users.data : []}
                          placeholder={t("selectResponsible", {
                            ns: "student",
                          })}
                        />
                      ) : (
                        ""
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem className={"grid gap-2"}>
                    <FormLabel>{t("comments", { ns: "exams" })}</FormLabel>
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
            <div className="flex gap-4 mt-4 w-full">
              <Button
                className="w-1/2"
                size="sm"
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
              >
                {t("cancel", { ns: "common" })}
              </Button>
              <ButtonLoading
                className="grow w-1/2"
                isLoading={isLoading}
                size="sm"
              >
                {t(type, { ns: "exams" })}
              </ButtonLoading>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
