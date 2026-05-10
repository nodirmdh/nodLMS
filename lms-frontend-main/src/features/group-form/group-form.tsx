import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select as SelectUI,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { MultiSelect } from "@/components/multi-select";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { IPostGroup } from "@/app/store/services/groups.service";
import { Select } from "@/components/select";
import { useGetMentorsSelectQuery } from "@/app/store/services/mentor.service";
import { useGetResponsiblesSelectQuery } from "@/app/store/services/user.service";
import { useGetCoursesSelectQuery } from "@/app/store/services/course.service";
import { groupSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonLoading } from "@/components/ui/loading-button";
import { DatePickerWithRange } from "@/components/data-picker-range/data-picker-range";
import { PageAccessed } from "@/components/page-accessed/page-accessed";
import { Combobox } from "@/components/comebox/comebox";
import { addThirtyMinutes, generateTimeArray } from "@/lib/utils.ts";

interface CourseFormProps {
  type: "create" | "update";
  initialValues: any;
  submitForm: (values: IPostGroup) => Promise<any>;
  isLoading: boolean;
}

export const GroupForm = ({
  type,
  initialValues,
  submitForm,
  isLoading,
}: CourseFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation("group");
  const [classDayLocal, setClassDaysLocal] = useState<string>(
    initialValues.classDays.includes("odd") ||
      initialValues.classDays.includes("even") ||
      initialValues.classDays.includes("every")
      ? initialValues.classDays[0]
      : "other"
  );

  const [weekDaysLocal, setWeekDaysLocal] = useState<string[]>(
    initialValues.classDays.includes("odd") ||
      initialValues.classDays.includes("even") ||
      initialValues.classDays.includes("every")
      ? []
      : initialValues.classDays
  );
  const OptinonDays = [
    {
      value: "even",
      label: t("even"),
    },
    {
      value: "odd",
      label: t("odd"),
    },
    {
      value: "every",
      label: t("every"),
    },
    {
      value: "other",
      label: t("otherDay"),
    },
  ];

  const courses = useGetCoursesSelectQuery();
  const mentors = useGetMentorsSelectQuery({});
  const responsibles = useGetResponsiblesSelectQuery();
  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    values: initialValues,
  });

  if (!courses.isSuccess || !mentors.isSuccess) {
    return <></>;
  }
  if (!mentors.data || mentors.data.length === 0) {
    return (
      <PageAccessed
        paht="/staffs/create"
        title={t("pleaseCreateStaffs")}
        info={t("infoCreateStaffs")}
      />
    );
  }

  if (!courses.data || courses.data.length === 0) {
    return (
      <PageAccessed
        paht="/courses/create"
        title={t("pleaseCreateCourse")}
        info={t("infoCreateCourse")}
      />
    );
  }

  const onSubmit = (values: z.infer<typeof groupSchema>) => {
    let newData;
    if (classDayLocal === "other") {
      newData = {
        ...values,
        classDays: weekDaysLocal,
        mentorId: parseInt(values.mentorId),
        responsibleId: parseInt(values.responsibleId),
        courseId: parseInt(values.courseId),
      };
    } else {
      newData = {
        ...values,
        classDays: [classDayLocal],
        mentorId: parseInt(values.mentorId),
        responsibleId: parseInt(values.responsibleId),
        courseId: parseInt(values.courseId),
      };
    }

    // @ts-ignore
    submitForm(newData)
      .then((res: any) => {
        if (res.data.id) {
          navigate("/groups");
          return toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
      })
      .catch((res: any) => {
        if (res) {
          toast({
            title: t("error-type", { ns: "common" }),
            description: ``,
            variant: "destructive",
          });
        }
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t(type, { ns: "group" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {courses.data
              ? courses.isSuccess && (
                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem className={"grid gap-2 grow"}>
                        <FormLabel>{t("course")}</FormLabel>
                        <FormControl>
                          <Select
                            field={field}
                            options={courses.data}
                            placeholder={t("choose.course")}
                            namespace={"staff"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              : ""}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input required {...field} placeholder={t("nameGroup")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mentors.data
              ? mentors.isSuccess && (
                  <FormField
                    control={form.control}
                    name="mentorId"
                    render={({ field }) => (
                      <FormItem className={"grid gap-2 grow"}>
                        <FormLabel>{t("mentor")}</FormLabel>
                        <FormControl>
                          {mentors.data ? (
                            <Combobox
                              className="w-full"
                              selected={field.value ? field.value : ""}
                              onChange={field.onChange}
                              options={
                                mentors.data?.length > 0 ? mentors.data : []
                              }
                              placeholder={t("mentorSelect", { ns: "groups" })}
                            />
                          ) : (
                            ""
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              : ""}
            {responsibles.data
              ? responsibles.isSuccess && (
                  <FormField
                    control={form.control}
                    name="responsibleId"
                    render={({ field }) => (
                      <FormItem className={"grid gap-2 grow"}>
                        <FormLabel>{t("responsible")}</FormLabel>
                        <FormControl>
                          <Select
                            field={field}
                            options={responsibles.data}
                            placeholder={t("selectResponsible", {
                              ns: "student",
                            })}
                            namespace={"staff"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              : ""}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className={"grid gap-2 grow"}>
                  <FormLabel>{t("date")}</FormLabel>
                  <FormControl>
                    <DatePickerWithRange
                      field={field}
                      namespace="dateRange"
                      className="w-full"
                      options={[]}
                      placeholder="Pick a date range"
                      onChange={field.onChange}
                      // diabledValue={
                      //   initialValues.diabledValue
                      //     ? initialValues.diabledValue
                      //     : new Date()
                      // }
                      type={initialValues.type ? initialValues.type : ""}
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
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("startTime")}</FormLabel>
                  <FormControl>
                    <SelectUI
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
                        {generateTimeArray("08:00", "22:00").map(
                          (hour, index) => (
                            <SelectItem value={hour} key={index}>
                              {hour}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </SelectUI>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("endTime")}</FormLabel>
                  <FormControl>
                    <SelectUI
                      onValueChange={(value) => {
                        form.setValue("endTime", addThirtyMinutes(value));
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Время закончание урока" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {generateTimeArray(
                          addThirtyMinutes(form.getValues("startTime")),
                          "22:30"
                        ).map((hour, index) => (
                          <SelectItem value={hour} key={index}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectUI>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classDays"
              render={() => (
                <FormItem className={"grid gap-2 grow"}>
                  <FormLabel>{t("classdays")}</FormLabel>
                  <FormControl>
                    <SelectUI
                      onValueChange={setClassDaysLocal}
                      value={classDayLocal}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={"select"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {OptinonDays.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                              defaultValue={classDayLocal}
                            >
                              {t(option.label)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </SelectUI>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {classDayLocal === "other" && (
              <FormItem className={"grid gap-2 grow"}>
                <FormLabel>{t("classdays")}</FormLabel>
                <MultiSelect
                  options={[
                    { value: "Mon", label: t("monday") },
                    { value: "Tues", label: t("tuesday") },
                    { value: "Wednes", label: t("wednesday") },
                    { value: "Thurs", label: t("thursday") },
                    { value: "Fri", label: t("friday") },
                    { value: "Satur", label: t("saturday") },
                    { value: "Sun", label: t("sunday") },
                  ]}
                  onValueChange={(el) => {
                    //@ts-ignore
                    setWeekDaysLocal(el);
                  }}
                  defaultValue={weekDaysLocal}
                  placeholder={t("selectOpinions")}
                  variant="inverted"
                  animation={2}
                  maxCount={3}
                />
              </FormItem>
            )}

            <div className="w-full flex row gap-3">
              <Link to={"/groups"} className="w-1/2">
                <Button variant="outline" size="sm" className="w-full">
                  {t("cancel")}
                </Button>
              </Link>
              {
                <ButtonLoading
                  className="grow w-1/2"
                  size="sm"
                  isLoading={isLoading}
                >
                  {t(type, { ns: "group" })}
                </ButtonLoading>
              }
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};
