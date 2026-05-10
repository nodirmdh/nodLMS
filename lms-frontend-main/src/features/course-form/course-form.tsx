import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { courseSchema } from "./schema";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { CourseBody } from "@/app/store/services/course.service";
import { Select } from "@/components/select";
import { useGetBranchesSelectQuery } from "@/app/store/services/branch.service";
import { ButtonLoading } from "@/components/ui/loading-button";
import { formatAmount } from "@/lib/utils";
interface CourseFormProps {
  type: "create" | "update";
  initialValues: CourseBody;
  submitForm: (values: CourseBody) => Promise<any>;
  isLoading: boolean;
}

export const CourseForm = ({
  type,
  initialValues,
  submitForm,
  isLoading,
}: CourseFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(["course", "common"]);
  const branchesList = useGetBranchesSelectQuery();

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    values: initialValues,
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof courseSchema>) => {
    submitForm(values)
      .then((res) => {
        if (res.data.id) {
          navigate("/courses");
          toast({
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
        }}
      >
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t(type, { ns: "course" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => {
                return (
                  <FormItem className={"grid gap-2"}>
                    <FormLabel>{t("price")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
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
                );
              }}
            />
            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("branch")}</FormLabel>
                  <FormControl>
                    {field.value && branchesList.data && (
                      <Select
                        options={branchesList.data}
                        field={field}
                        namespace="course"
                        placeholder={t("branch.placeholder")}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <div className="w-full flex row gap-3">
              <Link to={"/courses"} className="w-full lg:w-1/2">
                <Button variant="outline" className="w-full" size="sm">
                  {t("cancel", { ns: "common" })}
                </Button>
              </Link>
              <ButtonLoading
                className="grow w-1/2"
                size="sm"
                type="submit"
                isLoading={isLoading}
              >
                {t(type, { ns: "course" })}
              </ButtonLoading>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
