import {
  useGetGroupQuery,
  useGroupPouseMutation,
  useGroupLessonsQuery,
} from "@/app/store/services/groups.service";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/table";
import { useTranslation } from "react-i18next";
import { useStartGroupMutation } from "@/app/store/services/groups.service";
import { Badge } from "@/components/ui/badge";
import { NoItems } from "@/components/no-items/no-items";
import { formatPhoneNumber, toAuthRoleCheck } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
import { format } from "date-fns";
import { ButtonLoading } from "@/components/ui/loading-button";
import { Suspense, useState } from "react";

export const GroupInfo = () => {
  const { id } = useParams<string>();
  const [page, setPage] = useState(1);

  const { t } = useTranslation(["group", "group.info"]);

  const { data } = useGetGroupQuery(id as string);
  const lessons = useGroupLessonsQuery({ page: page, id: id as string });

  const [startGroup, startData] = useStartGroupMutation();

  const [pauseGroup, pouseData] = useGroupPouseMutation();

  const role = useSelector((state: RootState) => state.userState.role);

  const startButton = (id: number | undefined) => {
    if (id) {
      startGroup(`${id}`);
    }
  };

  const stopGroupClick = (id: number | undefined) => {
    if (id) {
      pauseGroup({ id: id, data: { status: "frozen" } });
    }
  };
  return (
    <div className="flex flex-col">
      <div className="flex items-center xs: flex-col md:flex-row">
        <h4 className="pb-1 text-xl font-semibold tracking-tight first:mt-0">
          {t("name")} - {data?.name}
        </h4>
        <div className="flex gap-4 xs:mx-auto flex-col md:flex-row md:ml-auto">
          {toAuthRoleCheck(role, ["CEO", "admin"]) &&
            data?.groupStudents &&
            data?.groupStudents.length > 0 &&
            (data?.status === "active" ? (
              <ButtonLoading
                size="sm"
                variant={"outline"}
                onClick={() => stopGroupClick(data?.id)}
                isLoading={pouseData.isLoading}
              >
                {t("pause", { ns: "group" })}
              </ButtonLoading>
            ) : (
              <ButtonLoading
                size="sm"
                variant={"outline"}
                onClick={() => startButton(data?.id)}
                isLoading={startData.isLoading}
              >
                {t("start", { ns: "group" })}
              </ButtonLoading>
            ))}
          {toAuthRoleCheck(role, ["CEO", "admin"]) && (
            <Link to={`/groups/update/${data?.id}`}>
              <Button size="sm">{t("edit", { ns: "common" })}</Button>
            </Link>
          )}
          <Link to={`/groups/${data?.id}/jurnal`}>
            <Button size="sm" variant="ghost">
              {t("jurnal", { ns: "common" })}
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-2 flex flex-col w-full">
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("data")}
          </legend>
          <div className="grid gap-y-4">
            <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 xs:grid-cols-2 gap-4 border-b pb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("name")}</p>
                <p className="text-sm font-medium leading-none">{data?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("status")}</p>
                <p className="text-sm font-medium leading-none">
                  {t(data?.status ? data?.status : "", { ns: "status" })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("startDay")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.fromDate ? format(data.fromDate, "dd.MM.yyyy") : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("pauseDay")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.toDate ? format(data.toDate, "dd.MM.yyyy") : ""}
                </p>
              </div>
            </div>
            <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 xs:grid-cols-2 gap-4 border-b pb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("startTime")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.startTime}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("endTime")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.endTime}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("responsible", { ns: "group" })}
                </p>
                <Link
                  to={`/staffs/${data?.responsible.id}`}
                  className="text-sm font-medium leading-none"
                >
                  {data?.responsible.fio}
                </Link>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("classdays")}
                </p>

                {data?.classDays && data?.classDays?.length > 1 ? (
                  <div className="flex gap-2 max-w-38 flex-wrap">
                    {data?.classDays.map((el) => (
                      <p>{t(el)}</p>
                    ))}
                  </div>
                ) : (
                  <p>{t(data?.classDays[0] ? data?.classDays[0] : "")}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("students.count")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.groupStudents.length}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("mentor")}</p>
                <p className="text-sm font-medium leading-none">
                  <Link to={`/mentors/${data?.mentor.id}`}>
                    {data?.mentor.user.fio}
                  </Link>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("mentorPhone", { ns: "mentor" })}
                </p>
                <p className="text-sm font-medium leading-none">
                  {formatPhoneNumber(
                    data?.mentor.user ? data.mentor.user.phone : ""
                  )}
                </p>
              </div>
            </div>
          </div>
        </fieldset>
        <div className="py-4">
          <h2 className="-ml-1 px-1 text-sm font-medium pb-4">
            {t("lessons")}
          </h2>
          <div className="">
            <Suspense fallback={<p>loading...</p>}>
              {lessons.data?.lessons && lessons.data.lessons.length > 0 ? (
                <Table
                  data={
                    lessons.data?.lessons?.length > 0
                      ? lessons.data.lessons
                      : []
                  }
                  columns={["name", "date", "status"]}
                  path={"lessons"}
                  withAction={true}
                  tag="lessons"
                  page={page}
                  setPage={setPage}
                  total={lessons.data?.total}
                />
              ) : (
                <NoItems head={`${t("noItem")}`} />
              )}
            </Suspense>
          </div>
        </div>
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("data")}
          </legend>

          <table className="border w-full table-auto rounded-lg text-base">
            <thead className="rounded-lg">
              <tr>
                <th className="px-4 py-2 text-left text-base font-semibold ">
                  {t("fio")}
                </th>
                <th className="px-4 py-2 text-left text-base font-semibold ">
                  {t("Status")}
                </th>
                <th className="px-4 py-2 text-left text-base font-semibold ">
                  {t("phone")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.groupStudents.map((el) => (
                <tr key={el.studentId} className="border-t-[1px] text-sm">
                  <td className="px-4 py-4">
                    <Link to={`/students/${el.studentId}`}>
                      {el.student.fio}
                    </Link>
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      variant="secondary"
                      className={`mr-2 last:mr-0 ${
                        el.status === "stopped"
                          ? "text-whitebg-primary bg-primary text-white opacity-80"
                          : el.status === "waitingConfirm"
                          ? "text-whitebg-primary opacity-80 text-black bg-purple-600"
                          : el.status === "active"
                          ? "text-whitebg-primary opacity-80 text-white bg-green-400 "
                          : " bg-red-600 text-white"
                      }`}
                    >
                      {t(el.status, { ns: "status" })}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {el.student.phone && formatPhoneNumber(el.student.phone)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>
      </div>
    </div>
  );
};
