import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { leedSchema } from "./schema";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multi-select";
import { Select } from "@/components/select";
import { useGetCoursesSelectQuery } from "@/app/store/services/course.service";
import { addThirtyMinutes, generateTimeArray, toAuthRoleCheck } from "@/lib/utils.ts";
import { MaskedField } from "@/components/masked-field";
import { ButtonLoading } from "@/components/ui/loading-button";
import { ILeedBody } from "@/app/store/services/leeds.service";
import { Link ,useNavigate} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
interface LeedFormProps {
  type: "CREATE" | "UPDATE";
  initialValues: ILeedBody;
  submitForm: any;
  isLoading: boolean;
  closeModal?: () => void;
  id?:string
}

export const LeedForm = ({
  type,
  initialValues,
  submitForm,
  isLoading,
  closeModal,
  id
}: LeedFormProps) => {
  const { t } = useTranslation(["group"]);
  const { toast } = useToast();
  const navigate=useNavigate()
  const role=useSelector((state:RootState)=>state.userState.role)
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
  const { data } = useGetCoursesSelectQuery();
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
  const optionInfo = [
    {
      value: "streetAd",
      label: t("streetAd"),
    },
    {
      value: "fromFriends",
      label: t("fromFriends"),
    },
    {
      value: "radio",
      label: t("radio"),
    },
    {
      value: "tv",
      label: t("tv"),
    },
    {
      value: "telegram",
      label: t("telegram"),
    },
    {
      value: "instagram",
      label: t("instagram"),
    },
  ];
  const form = useForm<z.infer<typeof leedSchema>>({
    resolver: zodResolver(leedSchema),
    values: initialValues,
  });

  const onSubmit = (values: z.infer<typeof leedSchema>) => {
    let newData;
    if (classDayLocal === "other") {
      newData = {
        ...values,
        classDays: weekDaysLocal,
        courseId: parseInt(values.courseId),
      };
    } else {
      newData = {
        ...values,
        classDays: [classDayLocal],
        courseId: parseInt(values.courseId),
      };
    }
    submitForm(newData)
      .then(() => {
        closeModal ? closeModal() : "";
        navigate("/leeds")
        toast({
          title: t("success", { ns: "common" }),
          description: ``,
        });
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
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="fio"
            render={({ field }) => (
              <FormItem className={"grid gap-2"}>
                <FormLabel>{t("fio")}</FormLabel>
                <FormControl>
                  <Input required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            <FormField
              control={form.control}
              name="discoveryMethod"
              render={({ field }) => (
                <FormItem className={"grid gap-2 grow"}>
                  <FormLabel>{t("discoveryMethod")}</FormLabel>
                  <FormControl>
                    <Select
                      field={field}
                      options={optionInfo}
                      placeholder={t("discoveryMethod")}
                      namespace={"staff"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem className={"grid gap-2 grow"}>
                  <FormLabel>{t("courseId")}</FormLabel>
                  <FormControl>
                    <Select
                      field={field}
                      options={data?data:[]}
                      placeholder={t("courseId")}
                      namespace={"staff"}
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
                <FormLabel>{t("comment")}</FormLabel>
                <FormControl>
                  <Input required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("startLesson")}</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("endLesson")}</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                      <SelectValue placeholder={t("classdays")} />
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
        </div>
        {type === "UPDATE"&&id ? (
          <div className="gap-4 pt-4 block md:grid md:grid-cols-3">
            <Link to={"/leeds"} className="w-full">
              <Button className="w-full mb-4" type="button" size="sm" variant="outline">
                {t("cancel")}
              </Button>
            </Link>
            <ButtonLoading
              className=" w-full text-white border mb-4"
              isLoading={isLoading}
              size="sm" 
            >
              {t("updateLeed", {ns:'leed'})}
            </ButtonLoading>
            {
              toAuthRoleCheck(role,["CEO","admin","manager"])
            }
            <Link to={`/leeds/${id}/student`} className="w-full">
              <Button
                className="w-full"
                type="button"
                variant="default"
                size="sm" 
              >
                {t("create", {ns:'students'})}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-8 pt-4">
            <Button
              className="w-1/2"
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              {t("cancel")}
            </Button>
            <ButtonLoading
              className="w-1/2 text-white border "
              isLoading={isLoading}
            >
              {t("createStudent")}
            </ButtonLoading>
          </div>
        )}
      </form>
    </Form>
  );
};
