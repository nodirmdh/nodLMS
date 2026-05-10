import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/multi-select/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/select";
import { MaskedField } from "@/components/masked-field";
import { ButtonLoading } from "@/components/ui/loading-button";
import { PageAccessed } from "@/components/page-accessed/page-accessed";
import { ImageUploader } from "@/components/image-uploader/image-uploader";
import { DisCountInput } from "@/components/ui/discount";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { staffSchema } from "./schema";
import { useNavigate } from "react-router-dom";
import { useGetMeQuery } from "@/app/store/services/user.service";
import { IUserCreate } from "@/common/types/user.interface";
import { formatAmount, formatNumber, toAuthRoleCheck } from "@/lib/utils";

interface StaffFormProps {
  type: "create" | "update";
  initialValues: IUserCreate;
  submitForm: (values: IUserCreate) => any;
  isLoading: boolean;
  id?: string;
}

export const StaffForm = ({
  type,
  initialValues,
  submitForm,
  isLoading,
}: StaffFormProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["staff", "role"]);
  const { toast } = useToast();

  const branches = useGetMeQuery();

  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialValues,
  });

  const onSubmit = (values: z.infer<typeof staffSchema>) => {
    values = {
      ...values,
      salaryMentorType: values.role.includes("mentor")
        ? values.salaryMentorType
        : "",
      salaryMentor:
        values.role.includes("mentor") &&
        values.salaryMentorType &&
        values.salaryMentor
          ? parseInt(formatNumber(`${values.salaryMentor}`))
          : 0,
      salary:
        values.salary &&
        toAuthRoleCheck(values.role, ["assistent", "manager", "admin", "CEO"])
          ? parseInt(formatNumber(`${values.salary}`))
          : 0,
    };

    submitForm(values)
      .then((res: any) => {
        navigate("/staffs");
        if (res.data.id) {
          return toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
        navigate("/staffs");
        toast({
          title: t("rolePermission", { ns: "common" }),
          description: ``,
          variant: "destructive",
        });
      })
      .catch(() => {
        navigate("/staffs");
        toast({
          title: t("error", { ns: "common" }),
          description: ``,
          variant: "destructive",
        });
      });
  };

  if (
    !branches.isLoading &&
    (!branches.data?.branches || branches.data.branches.length === 0)
  ) {
    return (
      <PageAccessed
        paht="/branches"
        title={t("branchCreate")}
        info={t("pleaseCreateBranch")}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        className="w-full max-w-4xl"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
        }}
      >
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("data")}
          </legend>
          <div className="grid gap-3">
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
            <div className="block row gap-2 md:flex">
              <FormField
                control={form.control}
                name="documentSeries"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 w-full mt-2 max-w-[240px]"}>
                    <FormLabel>{t("documentSeries")}</FormLabel>
                    <FormControl>
                      <MaskedField
                        mask="00"
                        definitions={{
                          0: /^[A-Z]+$/,
                        }}
                        value={field.value ? field.value : ""}
                        onInput={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentNo"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 grow mt-2"}>
                    <FormLabel>{t("documentNo")}</FormLabel>
                    <FormControl>
                      <MaskedField
                        mask="{0000000}"
                        value={field.value ? field.value : ""}
                        onInput={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("address")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex row gap-2">
              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 w-1/2"}>
                    <FormLabel>{t("birthday")}</FormLabel>
                    <FormControl>
                      <MaskedField
                        mask="{00}.{00}.{0000}"
                        value={field.value ? field.value : ""}
                        onInput={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 w-1/2"}>
                    <FormLabel>{t("sex")}</FormLabel>
                    <FormControl>
                      <Select
                        field={field}
                        options={[
                          {
                            value: "male",
                            label: "sex.male",
                          },
                          {
                            value: "female",
                            label: "sex.female",
                          },
                        ]}
                        placeholder={t("sex.placeholder")}
                        namespace={"staff"}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 grow"}>
                    <FormLabel>{t("education")}</FormLabel>
                    <FormControl>
                      <Select
                        field={field}
                        options={[
                          {
                            value: "1",
                            label: "education.1",
                          },
                          {
                            value: "2",
                            label: "education.2",
                          },
                          {
                            value: "3",
                            label: "education.3",
                          },
                          {
                            value: "4",
                            label: "education.4",
                          },
                          {
                            value: "5",
                            label: "education.5",
                          },
                          {
                            value: "6",
                            label: "education.6",
                          },
                        ]}
                        placeholder={t("education.placeholder")}
                        namespace={"staff"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialStatus"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 grow"}>
                    <FormLabel>{t("employmentStatus")}</FormLabel>
                    <FormControl>
                      <Select
                        field={field}
                        options={[
                          {
                            value: "1",
                            label: "employmentStatus.1",
                          },
                          {
                            value: "2",
                            label: "employmentStatus.2",
                          },
                          {
                            value: "3",
                            label: "employmentStatus.3",
                          },
                          {
                            value: "4",
                            label: "employmentStatus.4",
                          },
                          {
                            value: "5",
                            label: "employmentStatus.5",
                          },
                          {
                            value: "6",
                            label: "employmentStatus.6",
                          },
                        ]}
                        placeholder={t("employmentStatus.placeholder")}
                        namespace={"staff"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="familyStatus"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 grow"}>
                    <FormLabel>{t("employmentFamilyStatus")}</FormLabel>
                    <FormControl>
                      <Select
                        field={field}
                        options={[
                          {
                            value: "1",
                            label: "employmentFamilyStatus.1",
                          },
                          {
                            value: "2",
                            label: "employmentFamilyStatus.2",
                          },
                        ]}
                        placeholder={t("employmentFamilyStatus.placeholder")}
                        namespace={"staff"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              {type === "update" && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className={"grid gap-2 grow"}>
                      <FormLabel>{t("statusStaff")}</FormLabel>
                      <FormControl>
                        <Select
                          field={field}
                          options={[
                            {
                              value: "work",
                              label: t("work", { ns: "status" }),
                            },
                            {
                              value: "noWork",
                              label: t("noWork", { ns: "status" }),
                            },
                            {
                              value: "onSickLeave",
                              label: t("onSickLeave", { ns: "status" }),
                            },
                            {
                              value: "onVacation",
                              label: t("onVacation", { ns: "status" }),
                            },
                          ]}
                          placeholder={t("statusStaffCheck", { ns: "staff" })}
                          namespace={"staff"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        </fieldset>
        <div className="flex justify-center py-2">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem className={"grid gap-2"}>
                <ImageUploader
                  onChangeImage={field.onChange}
                  value={field.value}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("aboutRole")}
          </legend>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("role")}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[
                        { value: "admin", label: t("admin", { ns: "role" }) },
                        {
                          value: "manager",
                          label: t("manager", { ns: "role" }),
                        },
                        {
                          value: "assistent",
                          label: t("assestient", { ns: "role" }),
                        },
                        { value: "mentor", label: t("mentor", { ns: "role" }) },
                      ]}
                      onValueChange={(values) => {
                        field.onChange(values);
                      }}
                      defaultValue={field.value}
                      placeholder={t("role.placeholder")}
                      variant="inverted"
                      animation={1}
                      maxCount={5}
                      name={"role"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {toAuthRoleCheck(form.getValues("role"), [
              "assistent",
              "manager",
              "admin",
              "CEO",
            ]) && (
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => {
                  return (
                    <FormItem className={"grid gap-2"}>
                      <FormLabel>{t("price", { ns: "staff" })}</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          onChange={(event: any) => {
                            let newValue = event.target.value.replace(
                              /\s+/g,
                              ""
                            );
                            newValue = newValue.replace(/^0+/, "");
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
            )}
            {form.watch("role").includes("mentor") && (
              <>
                {form.watch("role").includes("mentor") && (
                  <>
                    <FormField
                      control={form.control}
                      name="salaryMentorType"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2"}>
                          <FormLabel>
                            {t("salaryMentorType", { ns: "staff" })}
                          </FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={[
                                {
                                  value: "fixed",
                                  label: t("salaryType.1"),
                                },
                                {
                                  value: "fixedLesson",
                                  label: t("salaryType.2"),
                                },
                                {
                                  value: "percentLesson",
                                  label: t("salaryType.3"),
                                },
                              ]}
                              namespace="salaryMentorType"
                              placeholder={t("salaryMentorType", {
                                ns: "staff",
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {form.watch("salaryMentorType") === "fixed" && (
                  <FormField
                    control={form.control}
                    name="salaryMentor"
                    render={({ field }) => {
                      return (
                        <FormItem className={"grid gap-2"}>
                          <FormLabel>{t("price", { ns: "staff" })}</FormLabel>
                          <FormControl>
                            <Input
                              value={`${
                                field.value === null ? 0 : field.value
                              }`}
                              onChange={(event: any) => {
                                let newValue = event.target.value.replace(
                                  /\s+/g,
                                  ""
                                );
                                newValue = newValue.replace(/^0+/, "");
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
                )}
                {form.watch("salaryMentorType") === "fixedLesson" && (
                  <FormField
                    control={form.control}
                    name="salaryMentor"
                    render={({ field }) => {
                      return (
                        <FormItem className={"grid gap-2"}>
                          <FormLabel>{t("lesson", { ns: "staff" })}</FormLabel>
                          <FormControl>
                            <Input
                              value={`${
                                field.value === null ? 0 : field.value
                              }`}
                              onChange={(event: any) => {
                                let newValue = event.target.value.replace(
                                  /\s+/g,
                                  ""
                                );
                                newValue = newValue.replace(/^0+/, "");
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
                )}
              </>
            )}
            {form.watch("salaryMentorType") === "percentLesson" && (
              <FormField
                control={form.control}
                name="salaryMentor"
                render={({ field }) => {
                  return (
                    <FormItem className={"grid gap-2"}>
                      <FormLabel>{t("percent", { ns: "staff" })}</FormLabel>
                      <FormControl>
                        <DisCountInput
                          className="w-full"
                          {...field}
                          value={`${field.value === null ? 0 : field.value}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
          </div>
        </fieldset>
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("contacts")}
          </legend>
          <div className="grid gap-3">
            <div className="flex flex-col gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 w-full"}>
                    <FormLabel>{t("phone")}</FormLabel>
                    <FormControl>
                      <MaskedField
                        value={field.value}
                        onInput={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneSecond"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 w-full"}>
                    <FormLabel>{t("phoneSecond")}</FormLabel>
                    <FormControl>
                      <MaskedField
                        value={field.value ? field.value : ""}
                        onInput={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="telegram"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("telegram")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("account")}
          </legend>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="cardNo"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("cardNumber")}</FormLabel>
                  <FormControl>
                    <MaskedField
                      mask="{0000} {0000} {0000} {0000}"
                      value={field.value ? field.value : ""}
                      onInput={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardPlaceholder"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("cardPlaceholder")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("branches")}
          </legend>
          <div className="grid gap-3">
            {branches.isSuccess &&
            branches?.data?.branches &&
            branches?.data?.branches?.length > 0
              ? branches.data.branches.map((branch: any) => (
                  <FormField
                    key={branch.id}
                    control={form.control}
                    name="branches"
                    render={({ field }) => (
                      <FormItem
                        key={branch.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(branch.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, branch.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value != branch.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {branch.name}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))
              : ""}
          </div>
        </fieldset>

        <div className="w-full flex row gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="sm"
            onClick={() => navigate(-1)}
          >
            {t("cancel")}
          </Button>
          <ButtonLoading className="grow w-1/2" isLoading={isLoading} size="sm">
            {t(type)}
          </ButtonLoading>
        </div>
      </form>
    </Form>
  );
};
