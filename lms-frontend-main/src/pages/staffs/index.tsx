import { Table , TableLoading } from "@/components/table";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Select } from "@/components/select";
import { useGetAllUsersQuery } from "@/app/store/services/user.service";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import useDebounce, { toAuthRoleCheck } from "@/lib/utils";
import { SearchInput } from "@/components/search-input";

const filterSchema = z.object({
  role: z.string().optional(),
  status: z.string().optional(),
});
import { toUrlParams } from "@/lib/utils";
import { NoItems } from "@/components/no-items/no-items";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
export const StaffsPage = () => {
  const [filter,setFilter]=useState<string>("")
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue,setSearchValue]=useState<string>("")
  const debouncedSearchTerm = useDebounce(searchValue, 500);
  const role = useSelector((state: RootState) => state.userState.role);
  const { t } = useTranslation("staff");
  const { data, isSuccess ,isLoading} = useGetAllUsersQuery({filter:filter,search:debouncedSearchTerm});
  const location = useLocation()
  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      role: "",
    },
  });
  const cancelFilter = () => {
    setFilter("");
    form.reset({ role: "", status: "" });
    setMenuOpen(false); 
  };


  const onSubmit = (values: z.infer<typeof filterSchema>) =>{
    setFilter(toUrlParams(values))
    setMenuOpen(false)
  }

  return (
    <>
      <div className="pt-2 xs:flex xs:items-center xs:flex-wrap md:flex md:flex-wrap justify-around items-center">
        <div className="flex justify-between gap-4">
        <h2 className="pb-1 font-semibold tracking-tight first:mt-0">
          {t("title")}
        </h2>
          <Link to="/staffs/create" className=" 2xl:hidden xl:hidden lg:hidden md:hidden">
            <Button size="sm">{t("create")}</Button>
          </Link>
        </div>
        <div className="flex items-center ml-auto">
          <SearchInput onchange={setSearchValue} value={searchValue}/>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button className="mr-4 " variant="ghost">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel>{t('filter', {ns:'common'})}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Form {...form}>
                <form
                  className="w-full max-w-4xl p-2 px-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="py-2">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>{t("role")}</FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={[
                                { value: "admin", label: t('admin') },
                                { value: "manager", label: t("manager") },
                                { value: "assistent", label: t("assistient")},
                                { value: "mentor", label: t("mentor") },
                                {value:"CEO",label:t("CEO")}
                              ]}
                              placeholder={t("roleSelect", {ns:'role'})}
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
                          <FormLabel>{t("status", {ns:'mentor'})}</FormLabel>
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
                                }
                              ]}
                              placeholder={t("selectStatus", {ns:'mentor'})}
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
                      {t('cancel', {ns:'staff'})}
                    </Button>
                  </div>
                </form>
              </Form>
            </DropdownMenuContent>
          </DropdownMenu>
          {toAuthRoleCheck(role, ["CEO"]) &&<Link to="/staffs/create"  className=" hidden 2xl:block xl:block lg:block md:block">
            <Button size="sm">{t("create")}</Button>
          </Link>}
        </div>
      </div>
      {
        isLoading?<TableLoading 
        columns={["avatar","fio", "role", "status", "phone", "branches"]}
        tag={"staff"}
        withAction/>:""
      }
      {isSuccess &&(data.length > 0 ? (
        <Table
          data={data}
          columns={["avatar","fio", "role", "status", "phone", "branches"]}
          path={"staffs"}
          tag={"staff"}
          withAction
        />
      ) : ( <NoItems head={t('noItem', {ns:'group'})} location={location.pathname}/>))}
    </>
  );
};
