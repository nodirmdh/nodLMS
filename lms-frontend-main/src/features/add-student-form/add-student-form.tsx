import { FC } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { filterOutNonMatching, formatAmount, formatNumber } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { addStudentSchema } from "./schema";
import { useTranslation } from "react-i18next";
import { Combobox } from "@/components/comebox/comebox";
import { Input } from "@/components/ui/input";

interface IProp {
  setIsModal: (event: boolean) => void;
  setGroupsValue: (event: any) => void;
  groupsValue: {
    groupId: string;
    discount: number;
    discountComment: string;
  }[];
  groups:
    | {
        label: string;
        value: string;
        coursePrice: number;
      }[]
    | undefined;
  initialValues: {
    groupId: string;
    discount: number;
    discountComment: string;
    name?: string;
  };
}
export const AddStudentForm: FC<IProp> = ({
  setIsModal,
  setGroupsValue,
  groupsValue,
  initialValues,
  groups,
}) => {
  const form = useForm({
    resolver: zodResolver(addStudentSchema),
    defaultValues: initialValues,
  });
  const { t } = useTranslation("groups");
  const handleInnerFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    event.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  const onSubmit = (values: z.infer<typeof addStudentSchema>) => {
    const name = groups?.find((el) => {
      if (el.value == values.groupId) {
        return el.label;
      }
    });
    if (initialValues.groupId) {
      setGroupsValue(
        (
          prevGroups: {
            groupId: string;
            discount: number;
            discountComment: string;
            name?: string;
          }[]
        ) => {
          for (let i = 0; i < prevGroups.length; i++) {
            let groupName: string | undefined = "";
            if (groups && groups.length > 0) {
              for (let j = 0; j < groups.length; j++) {
                if (groups[j].value == values.groupId) {
                  groupName = groups[j].label;
                }
              }
            }
            if (prevGroups[i].groupId == initialValues.groupId) {
              prevGroups[i].discount = parseInt(
                formatNumber(values.discount ? `${values.discount}` : "0")
              );
              prevGroups[i].groupId = values.groupId ?? prevGroups[i].groupId;
              prevGroups[i].name = groupName ?? prevGroups[i].name;
            }
          }
          return prevGroups;
        }
      );
      return setIsModal(false);
    }
    if (!values.groupId) {
      return setIsModal(false);
    }

    setGroupsValue((el: any) => [
      ...el,
      {
        ...values,
        discount: parseInt(
          formatNumber(values.discount ? `${values.discount}` : "0")
        ),
        name: name?.label,
      },
    ]);
    setIsModal(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleInnerFormSubmit}>
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem className={"grid gap-2"}>
                <FormLabel>{t("groupId", { ns: "role" })}</FormLabel>
                <FormControl>
                  {groups ? (
                    <Combobox
                      className="w-full"
                      selected={field.value ? field.value : ""}
                      onChange={field.onChange}
                      options={
                        groups.length > 0
                          ? groups
                            ? initialValues.groupId
                              ? groups.map((el) => {
                                  return {
                                    value: el.value.toString(),
                                    label: el.label,
                                  };
                                })
                              : filterOutNonMatching(groups, groupsValue)
                            : []
                          : []
                      }
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
            name="discount"
            render={({ field }) => {
              return (
                <FormItem className={"grid gap-2 py-4 relative"}>
                  <FormLabel>{t("discount")}</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value}
                      placeholder={t("summa", { ns: "group" })}
                      onChange={(event: any) => {
                        let newValue = event.target.value.replace(/\s+/g, "");
                        newValue = newValue.replace(/^0+/, "");
                        if (/^\d*$/.test(newValue)) {
                          field.onChange(formatAmount(newValue));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <span className="absolute top-1/2 right-4 -translate-y-[6px] text-muted-foreground">
                    {t("sum", { ns: "list" })}
                  </span>
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="discountComment"
            render={({ field }) => (
              <FormItem className={"grid gap-2"}>
                <FormLabel>{t("comment")}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t("comment")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              className="w-1/2"
              size="sm"
              onClick={() => setIsModal(false)}
            >
              {t("cancel", { ns: "group" })}
            </Button>
            <Button className="w-1/2" size="sm">
              {t("add", { ns: "group" })}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
