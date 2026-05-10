import { useState } from "react";
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
import { SlidersHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetStudentsQuery } from "@/app/store/services/student.service";
import { useGetCoursesSelectQuery } from "@/app/store/services/course.service";
import { SearchInput } from "@/components/search-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Select } from "@/components/select";
import { Link, useLocation } from "react-router-dom";
import { toAuthRoleCheck, toUrlParams } from "@/lib/utils";
import useDebounce from "@/lib/utils";
import { NoItems } from "@/components/no-items/no-items";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";

const filterSchema = z.object({
  courseId: z.string().optional(),
  status: z.string().optional(),
  branchId: z.string().optional(),
});

export const StudentsPage = () => {
  const branchId = useSelector((state: RootState) => state.userState.branch);
  const role = useSelector((state: RootState) => state.userState.role);
  const { t } = useTranslation(["common", "role"]);
  const [pageData, setPageData] = useState<number>(1);
  const location = useLocation();
  const [searchValue, setSearchValue] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchValue, 500);
  const [filter, setFilter] = useState<string>(
    `&status=active&branchId=${branchId}`
  );
  const [menuOpen, setMenuOpen] = useState(false); // DropdownMenu holatini kuzatish
  const { data, isSuccess, isLoading } = useGetStudentsQuery({
    filter: filter,
    search: debouncedSearchTerm,
    page: pageData,
    branch: branchId,
  });
  const courses = useGetCoursesSelectQuery();
  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "active",
      branchId: `${branchId}`,
    },
  });

  const cancelFilter = () => {
    setSearchValue("");
    setFilter("");
    form.reset({ courseId: "", status: "" });
    setMenuOpen(false);
  };

  const onSubmit = (values: z.infer<typeof filterSchema>) => {
    setFilter(toUrlParams(values));
    setMenuOpen(false);
  };

  return (
    <>
      <div className="pt-2 xs:flex xs:items-center xs:flex-wrap md:flex md:flex-wrap justify-around items-center">
        <div className="flex justify-between gap-4">
          <h2 className="pb-1 font-semibold tracking-tight">
            {t("student", { ns: "common" })}
          </h2>
          {toAuthRoleCheck(["CEO", "admin"], role) && (
            <Link
              to="/students/create"
              className=" 2xl:hidden xl:hidden lg:hidden md:hidden"
            >
              <Button size="sm">{t("create", { ns: "students" })}</Button>
            </Link>
          )}
        </div>
        <div className="flex items-center ml-auto">
          <SearchInput onchange={setSearchValue} value={searchValue} />
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button className="mr-4 " variant="ghost">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 translate-x-[-50px]">
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
                                  value: "active",
                                  label: t("active", { ns: "role" }),
                                },
                                {
                                  value: "noActive",
                                  label: t("noActive", { ns: "role" }),
                                },
                                {
                                  value: "vacation",
                                  label: t("vacation", { ns: "role" }),
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
                      name="branchId"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>
                            {t("branchID", { ns: "mentor" })}
                          </FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={[
                                {
                                  value: "all",
                                  label: t("allBranch", { ns: "mentor" }),
                                },
                                {
                                  value: `${branchId}`,
                                  label: t("thisBranch", { ns: "mentor" }),
                                },
                              ]}
                              placeholder={t("selectCourse", { ns: "mentor" })}
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
                      className="w-full"
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
          {toAuthRoleCheck(["CEO", "admin"], role) && (
            <Link
              to="/students/create"
              className=" hidden 2xl:block xl:block lg:block md:block"
            >
              <Button size="sm">{t("create", { ns: "students" })}</Button>
            </Link>
          )}
        </div>
      </div>
      <div className="hidden 2xl:block xl:block lg:block sm:hidden">
        {isLoading ? (
          <TableLoading
            columns={["avatar", "fio", "phone", "sex"]}
            tag="students"
          />
        ) : (
          isSuccess &&
          (data?.data?.length > 0 ? (
            <Table
              tag="students"
              data={data?.data || []}
              columns={["avatar", "fio", "phone"]}
              path="students"
              withAction
              setPage={setPageData}
              page={pageData}
              total={data?.total || 0}
            />
          ) : (
            <NoItems
              head={t("noItem", { ns: "group" })}
              location={location.pathname}
            />
          ))
        )}
      </div>
      <div className="block lg:hidden sm:block">
        {isLoading ? (
          <TableLoading columns={["avatar", "fio", "phone"]} tag="students" />
        ) : isSuccess && data?.data.length > 0 ? (
          <Table
            tag={"students"}
            data={data?.data ? data.data : []}
            columns={["avatar", "fio", "phone"]}
            path={"students"}
            withAction
            setPage={setPageData}
            page={pageData}
            total={data?.total ? data?.total : 0}
          />
        ) : (
          <NoItems
            head={t("noItem", { ns: "group" })}
            location={location.pathname}
          />
        )}
      </div>
    </>
  );
};
