import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MaskedField } from "@/components/masked-field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select } from "@/components/select";
import { useToast } from "@/components/ui/use-toast";
import { ButtonLoading } from "@/components/ui/loading-button";
import { ImageUploader } from "@/components/image-uploader/image-uploader";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { schemaStudent } from "./schema";

import { ICreateStudent } from "@/common/types/students.interface";
import { useGetSelectGroupsMutation } from "@/app/store/services/groups.service";
import { AddStudentForm } from "../add-student-form";
import { removeElementByIndex } from "@/lib/utils";
import { XCircle, PencilLine } from "lucide-react";

interface StaffFormProps {
  type: "create" | "update";
  initialValues: ICreateStudent;
  submitForm: (values: ICreateStudent) => Promise<any>;
  isLoading: boolean;
}

export const StudentForm = ({
  type,
  initialValues,
  submitForm,
  isLoading,
}: StaffFormProps) => {
  const [groupsId, setGroupId] = useState<number | null>();

  const [groupsValue, setGroupsValue] = useState<
    {
      groupId: string;
      discount: number;
      discountComment: string;
      name?: string;
    }[]
  >(initialValues.groups ? initialValues.groups : []);
  const [isModal, setIsModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const navigate = useNavigate();

  const { t } = useTranslation(["staff", "role"]);
  const { toast } = useToast();
  const [groupsPost, groupsData] = useGetSelectGroupsMutation();
  const form = useForm<z.infer<typeof schemaStudent>>({
    resolver: zodResolver(schemaStudent),
    defaultValues: initialValues,
  });

  const removeGroup = () => {
    setGroupsValue(removeElementByIndex(groupsValue, groupsId as number));
    setGroupId(null);
    setIsModal(false);
  };

  const onModalClick = () => {
    setAddModal(true);
    groupsPost({ statuses: ["waiting", "active"] });
  };

  const editGroupsClick = (event: any, index: number) => {
    setAddModal(true);
    groupsPost({ statuses: ["waiting", "active"] });
    setGroupId(index + 1);
    event.stopPropagation();
  };

  const onSubmit = (values: ICreateStudent) => {
    submitForm({ ...values, groups: groupsValue })
      .then((res: any) => {
        navigate(-1);
        if (res) {
          return toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
      })
      .catch((e: any) => {
        if (e) {
          toast({
            title: t("error", { ns: "common" }),
            description: ``,
            variant: "destructive",
          });
        }
      });
  };

  return (
    <>
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
              <div className="block  md:flex row gap-2">
                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem className={"grid gap-2 w-full pt-2"}>
                      <FormLabel>{t("birthday")}</FormLabel>
                      <FormControl>
                        <MaskedField
                          mask="{00}.{00}.{0000}"
                          value={field.value || ""}
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
                  defaultValue={form.getValues("sex")}
                  render={({ field }) => (
                    <FormItem className={"grid gap-2 w-full pt-2"}>
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
              <div className="block md:grid gap-3 grid-cols-2">
                <FormField
                  control={form.control}
                  name={"disability"}
                  render={({ field }) => (
                    <FormItem className={"grid gap-2 w-full pt-2"}>
                      <FormLabel>{t("disability", { ns: "role" })}</FormLabel>
                      <FormControl>
                        <Select
                          field={field}
                          options={[
                            {
                              value: "true",
                              label: t("invalit", { ns: "role" }),
                            },
                            {
                              value: "false",
                              label: t("saw", { ns: "role" }),
                            },
                          ]}
                          placeholder={t("disability", { ns: "role" })}
                          namespace={"staff"}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentSeries"
                  render={({ field }) => (
                    <FormItem className={"grid gap-2 w-full mt-2"}>
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
              </div>
              <div className="grid gap-4 md:grid-cols-2">
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
                <FormField
                  control={form.control}
                  name="pinfl"
                  render={({ field }) => (
                    <FormItem className={"grid gap-2 w-full pt-2"}>
                      <FormLabel>{t("pinfl", { ns: "students" })}</FormLabel>
                      <FormControl>
                        <MaskedField
                          mask="0 000000 000 000 0"
                          value={field.value ? field.value : ""}
                          onInput={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
            <legend className="-ml-1 px-1 text-sm font-medium">
              {t("groups", { ns: "nav" })}
            </legend>
            <div className="flex gap-5 pb-3 flex-wrap">
              <Dialog open={isModal}>
                <DialogContent
                  className="sm:max-w-[425px] xs:max-w-[280px]"
                  onInteractOutside={() => setIsModal(false)}
                  hideCloseClick={() => setIsModal(false)}
                >
                  <DialogHeader>
                    <DialogTitle>
                      {t("removeFromGroup", { ns: "students" })}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-between pt-5 flex-col gap-2 md:">
                    <Button
                      type="submit"
                      variant="outline"
                      onClick={() => setIsModal(false)}
                    >
                      {t("cancel", { ns: "common" })}
                    </Button>
                    <Button type="submit" onClick={removeGroup}>
                      {t("apply", { ns: "groups" })}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {groupsValue?.length > 0 &&
                groupsValue.map((el, index) => {
                  return (
                    <Badge
                      key={el.groupId}
                      className="flex justify-between gap-2"
                    >
                      {el?.name}
                      <div className="flex">
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            setIsModal(true);
                            event.stopPropagation();
                            setGroupId(index);
                          }}
                        />
                        <PencilLine
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => editGroupsClick(event, index)}
                        />
                      </div>
                    </Badge>
                  );
                })}
            </div>
            <Dialog open={addModal}>
              <DialogTrigger asChild>
                <Button
                  className="w-full my-6"
                  type="button"
                  size="sm"
                  onClick={onModalClick}
                >
                  {t("add", { ns: "common" })}
                </Button>
              </DialogTrigger>
              <DialogContent
                className="w-[min(100%-30px,450px)]"
                onInteractOutside={() => setAddModal(false)}
                hideCloseClick={() => setAddModal(false)}
              >
                <AddStudentForm
                  setIsModal={setAddModal}
                  setGroupsValue={setGroupsValue}
                  groupsValue={groupsValue}
                  groups={groupsData.data}
                  initialValues={
                    groupsId && groupsValue
                      ? groupsValue[groupsId - 1]
                      : { groupId: "", discount: 0, discountComment: "" }
                  }
                />
              </DialogContent>
            </Dialog>
          </fieldset>

          <div className="flex justify-center py-2">
            <FormField
              control={form.control}
              name="telegram"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      onChangeImage={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
            <legend className="-ml-1 px-1 text-sm font-medium">
              {t("contacts")}
            </legend>
            <div className="grid gap-3">
              <div className="flex row gap-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className={"grid gap-2 w-1/2"}>
                      <FormLabel>{t("phone")}</FormLabel>
                      <FormControl>
                        <MaskedField
                          value={field.value || ""}
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
              {t("father.info", { ns: "role" })}
            </legend>
            <FormField
              control={form.control}
              name="fatherFio"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("fatherFio", { ns: "role" })}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="block  md:grid gap-4 mb-2 grid-cols-2">
              <FormField
                control={form.control}
                name="fatherJob"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 pt-2"}>
                    <FormLabel>{t("fatherJob", { ns: "role" })}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherPhone"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 w-full pt-2"}>
                    <FormLabel>{t("fatherPhone", { ns: "role" })}</FormLabel>
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
          </fieldset>
          <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
            <legend className="-ml-1 px-1 text-sm font-medium">
              {t("monther.info", { ns: "role" })}
            </legend>
            <FormField
              control={form.control}
              name="montherFio"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("montherFio", { ns: "role" })}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="block md:grid gap-4 md:mb-2 grid-cols-2">
              <FormField
                control={form.control}
                name="montherJob"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 mt-2"}>
                    <FormLabel>{t("montherJob", { ns: "role" })}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="montherPhone"
                render={({ field }) => (
                  <FormItem className={"grid gap-2 w-full mt-2"}>
                    <FormLabel>{t("montherPhone", { ns: "role" })}</FormLabel>
                    <FormControl>
                      <MaskedField
                        value={field.value || ""}
                        onInput={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </fieldset>

          <div className="flex row gap-3">
            <Button
              onClick={() => navigate(-1)}
              type="button"
              variant="outline"
              className="w-full "
              size="sm"
            >
              {t("cancel")}
            </Button>
            <ButtonLoading
              className="grow w-1/2"
              isLoading={isLoading}
              size="sm"
            >
              {t(type, { ns: "students" })}
            </ButtonLoading>
          </div>
        </form>
      </Form>
    </>
  );
};
