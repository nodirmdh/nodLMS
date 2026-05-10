import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { LoadingMentor } from "./loading-mentors";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { SlidersHorizontal, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useGetMentorsQuery } from "@/app/store/services/mentor.service";
import { useGetCoursesSelectQuery } from "@/app/store/services/course.service";
import { Link } from "react-router-dom";
import { useState } from "react";
import { formatPhoneNumber, toUrlParams } from "@/lib/utils";
import { NoItems } from "@/components/no-items/no-items";

const filterSchema = z.object({
  courseId: z.string().optional(),
  status: z.string().optional(),
});

export const MentorsPage = () => {
  const { t } = useTranslation(["common", "role", "mentor"]);
  const [filter, setFilter] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, isSuccess, isLoading } = useGetMentorsQuery(filter);
  const courses = useGetCoursesSelectQuery();
  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "",
    },
  });

  const cancelFilter = () => {
    setFilter("");
    form.reset({ courseId: "", status: "" });
    setMenuOpen(false);
  };
  const onSubmit = (values: z.infer<typeof filterSchema>) => {
    setFilter(toUrlParams(values));
    setMenuOpen(false);
  };

  if (isLoading) {
    return <LoadingMentor />;
  }
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="pb-1 font-semibold tracking-tight first:mt-0">
          {t("mentors", { ns: "mentor" })}
        </h2>
        <div className="flex ml-auto">
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
                          <FormLabel>{t("status")}</FormLabel>
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
        </div>
      </div>
      <div className="">
        {isSuccess &&
          (data.length > 0 ? (
            <div className="grid md:grid-cols-1 xl:grid-cols-3 gap-[20px] lg:grid-cols-2 sm:grid-cols-2 text">
              {data?.map(({ id, user, groups }: any) => {
                return (
                  <Link to={`/mentors/${id}`} key={id}>
                    <div className="mx-auto bg-white shadow-md rounded-lg border border-gray-300 hover:shadow-lg transition-shadow duration-300">
                      <div className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={
                                user.avatar
                                  ? `${
                                      import.meta.env.VITE_API_URL
                                    }${user.avatar.substring(1)}`
                                  : "/assets/images/user.png"
                              }
                              alt={user.fio}
                            />
                            <AvatarFallback>
                              <User />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <div className="font-semibold text-gray-800">
                              {user.fio}
                            </div>
                            <div className="text-gray-500">
                              {t("phone", { ns: "group" })}:{" "}
                              {formatPhoneNumber(user.phone)}
                            </div>

                            {user?.status && (
                              <span
                                className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                  user?.status === "waiting" ||
                                  user?.status === "new" ||
                                  user?.status === "stopped"
                                    ? "text-whitebg-primary bg-primary text-white opacity-80"
                                    : user?.status === "waitingConfirm" ||
                                      user?.status === "vacation" ||
                                      user?.status === "frozen"
                                    ? "text-whitebg-primary opacity-80 text-white bg-purple-600"
                                    : user?.status === "completed" ||
                                      user?.status === "active" ||
                                      user?.status === "work" ||
                                      user?.status === "passed"
                                    ? "text-whitebg-primary opacity-80 text-white bg-green-400 "
                                    : " bg-red-600 text-white"
                                }`}
                              >
                                {t(user.status ? user.status : "", {
                                  ns: "status",
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 h-[45px]">
                          <h4 className="text-xs font-medium text-gray-600">
                            {t("groups", { ns: "groups" })}:
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {groups.slice(0, 1).map((el: { name: string }) => (
                              <span
                                className="inline-block bg-blue-500 text-white rounded-full px-2 py-1 text-xs"
                                key={el.name}
                              >
                                {`#${el.name}`}
                              </span>
                            ))}
                            {groups.length > 1 && (
                              <span className="inline-block bg-gray-300 text-gray-600 rounded-full px-2 py-1 text-xs">
                                +{groups.length - 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className=" flex items-center justify-center">
              <NoItems head={t("noItem", { ns: "group" })} />
            </div>
          ))}
      </div>
    </>
  );
};
