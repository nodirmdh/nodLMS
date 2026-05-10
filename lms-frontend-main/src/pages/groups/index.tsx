import { Table, TableLoading } from "@/components/table";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Link, useLocation } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
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
import { useGetGroupsQuery } from "@/app/store/services/groups.service";
import { useGetCoursesSelectQuery } from "@/app/store/services/course.service";
import { toAuthRoleCheck, toUrlParams } from "@/lib/utils";
import { FC, useState } from "react";
import { NoItems } from "@/components/no-items/no-items";
import { useGetMentorsSelectQuery } from "@/app/store/services/mentor.service";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";

const filterSchema = z.object({
  courseId: z.string().optional(),
  classDays: z.string().optional(),
  status: z.string().optional(),
  mentorId: z.string().optional(),
});

export const GroupsPage: FC = () => {
  const [filter, setFilters] = useState<string>("");

  const role = useSelector((state: RootState) => state.userState.role);

  const { t } = useTranslation("groups");

  const [page, setPage] = useState<number>(1);

  const [menuOpen, setMenuOpen] = useState(false);

  const { data, isSuccess, isLoading } = useGetGroupsQuery({
    page: page,
    filter: filter,
  });

  const location = useLocation();

  const courses = useGetCoursesSelectQuery();

  const mentors = useGetMentorsSelectQuery({});

  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "",
    },
  });

  const cancelFilter = () => {
    setFilters("");
    form.reset({ courseId: "", status: "" });
    setMenuOpen(false);
  };

  const onSubmit = (values: {
    courseId?: string;
    status?: string;
    classDays?: string;
  }) => {
    setFilters(toUrlParams(values));
    setMenuOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="flex items-center pt-2 pb-2">
        <h2 className="pb-1 font-semibold tracking-tight first:mt-0">
          {t("groups")}
        </h2>
        <div className="flex items-center ml-auto">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button className="mr-4 " variant="ghost">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
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
                      name="courseId"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>
                            {t("courseID", { ns: "mentor" })}
                          </FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={courses.data ? courses.data : []}
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
                          <FormLabel>{t("status", { ns: "mentor" })}</FormLabel>
                          <FormControl>
                            <Select
                              field={field}
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
                              placeholder={t("selectStatus", { ns: "mentor" })}
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
                      name="mentorId"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>{t("mentor", { ns: "mentor" })}</FormLabel>
                          <FormControl>
                            <Select
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
                  </div>
                  <div className="py-2">
                    <FormField
                      control={form.control}
                      name="classDays"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>{t("classDays")}</FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={[
                                {
                                  value: "even",
                                  label: t("even", { ns: "group" }),
                                },
                                {
                                  value: "odd",
                                  label: t("odd", { ns: "group" }),
                                },
                                {
                                  value: "every",
                                  label: t("every", { ns: "group" }),
                                },
                                {
                                  value: "other",
                                  label: t("otherDay", { ns: "group" }),
                                },
                              ]}
                              placeholder={t("selectDays", { ns: "role" })}
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
          {toAuthRoleCheck(role, ["CEO", "admin"]) && (
            <Link to={`/groups/create`}>
              <Button size="sm">{t("create", { ns: "group" })}</Button>
            </Link>
          )}
        </div>
      </div>
      <div className="hidden 2xl:block xl:block lg:block md:block">
        {isLoading ? (
          <TableLoading
            columns={["name", "status", "fromDate", "startTime", "endTime"]}
            tag={"groups"}
            withAction
          />
        ) : (
          isSuccess &&
          (data?.data.length > 0 ? (
            <Table
              data={data?.data ?? []}
              columns={["name", "status", "fromDate", "startTime", "endTime"]}
              path={"groups"}
              withAction
              tag="groups"
              setPage={setPage}
              page={page}
              total={data?.total}
            />
          ) : (
            <NoItems
              head={t("noItem", { ns: "group" })}
              location={
                toAuthRoleCheck(["CEO", "admin"], role) ? location.pathname : ""
              }
            />
          ))
        )}
      </div>
      <div className="block 2xl:hidden xl:hidden lg:hidden md:hidden">
        {isLoading ? (
          <TableLoading
            columns={["name", "status", "startTime"]}
            tag={"groups"}
            withAction
          />
        ) : (
          isSuccess &&
          (data?.data.length > 0 ? (
            <Table
              data={data?.data ?? []}
              columns={["name", "status", "startTime"]}
              path={"groups"}
              withAction
              tag="groups"
              setPage={setPage}
              page={page}
              total={data?.total}
            />
          ) : (
            <NoItems
              head={t("noItem", { ns: "group" })}
              location={location.pathname}
            />
          ))
        )}
      </div>
    </>
  );
};
