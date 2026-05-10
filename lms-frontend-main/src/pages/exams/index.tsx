import { FC } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { SlidersHorizontal } from "lucide-react";
import { Table, TableLoading } from "@/components/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Select } from "@/components/select";
import { useGetGroupsSelectQuery } from "@/app/store/services/groups.service";
import { useGetExamsQuery } from "@/app/store/services/test.service";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toAuthRoleCheck, toUrlParams } from "@/lib/utils";
import { NoItems } from "@/components/no-items/no-items";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";

const filterSchema = z.object({
  groupId: z.string().optional(),
  status: z.string().optional(),
});
const Exams: FC = () => {
  const { t } = useTranslation(["common", "role", "mentor"]);
  const [dataPage, setDataPage] = useState<number>(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const role = useSelector((state: RootState) => state.userState.role);
  const { data, isSuccess, isLoading } = useGetExamsQuery({
    page: dataPage,
    filter: filter,
  });
  const groups = useGetGroupsSelectQuery();
  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "",
    },
  });

  const cancelFilter = () => {
    setFilter("");
    form.reset({ groupId: "", status: "" });
    setMenuOpen(false);
  };
  const onSubmit = (values: z.infer<typeof filterSchema>) => {
    setMenuOpen(false);
    setFilter(toUrlParams(values));
  };

  return (
    <>
      <div className="flex items-center pt-2 pb-2">
        <h2 className="pb-1 font-semibold tracking-tight first:mt-0">
          {t("Tests", { ns: "mentor" })}
        </h2>
        <div className="flex items-center ml-auto">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button className="mr-4 " variant="ghost">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 translate-x-[-10px]">
              <DropdownMenuLabel>
                {t("filter", { ns: "common" })}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Form {...form}>
                <form
                  className="w-full max-w-4xl p-2 px-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="py-2">
                    <FormField
                      control={form.control}
                      name="groupId"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>{t("groupId", { ns: "role" })}</FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={groups.data ? groups.data : []}
                              placeholder={t("selectCourse", { ns: "mentor" })}
                              namespace={"staff"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="py-2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>{t("status")}</FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={[
                                {
                                  value: "new",
                                  label: t("new", { ns: "status" }),
                                },
                                {
                                  value: "passed",
                                  label: t("passed", { ns: "status" }),
                                },
                                {
                                  value: "cancelled",
                                  label: t("cancelled", { ns: "status" }),
                                },
                              ]}
                              placeholder={t("selectStatus", { ns: "mentor" })}
                              namespace={"staff"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className=" flex w-full gap-4 mt-4">
                    <Button className="w-1/2 flex  items-center " size="sm">
                      {t("apply", { ns: "common" })}
                    </Button>
                    <Button
                      className="w-1/2"
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={cancelFilter}
                    >
                      {t("cancel", { ns: "common" })}
                    </Button>
                  </div>
                </form>
              </Form>
            </DropdownMenuContent>
          </DropdownMenu>
          {toAuthRoleCheck(role, ["CEO", "admin", "manager", "assistent"]) && (
            <Link to="/exams/create">
              <Button size="sm">{t("CREATE", { ns: "exams" })}</Button>
            </Link>
          )}
        </div>
      </div>
      <div>
        {isLoading ? (
          <TableLoading columns={["name", "status", "date"]} tag={"exams"} />
        ) : (
          isSuccess &&
          (data?.data.length > 0 ? (
            <Table
              data={data?.data ? data?.data : []}
              columns={["name", "status", "date"]}
              path={"exams"}
              tag={"exams"}
              withAction
              total={data?.total}
              setPage={setDataPage}
              page={dataPage}
            />
          ) : (
            <NoItems head={t("noItem", { ns: "group" })} />
          ))
        )}
      </div>
    </>
  );
};

export { Exams };
