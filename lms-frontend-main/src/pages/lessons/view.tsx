import { useEffect, useState } from "react";
import { NoItems } from "@/components/no-items/no-items";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";

import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleCheckBig, CircleX, Speech, Syringe } from "lucide-react";
import { LoaderLesson } from "./loaderLesson";
import { RootState } from "@/app/store/store.config";
import {
  useGetLessonQuery,
  useStatusPostLessonMutation,
} from "@/app/store/services/schedule.service";

import { StatusLessonForm } from "@/features/lesson-status";
import { toAuthRoleCheck } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/utils";

export const LessonViewPage = () => {
  const { t } = useTranslation("");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetLessonQuery(id as string);
  const user = useSelector((state: RootState) => state.userState);
  const [statusPost, statusData] = useStatusPostLessonMutation();
  const [isModal, setIsModal] = useState(false);
  useEffect(() => {
    if (data) {
      refetch();
    }
  }, []);

  if (isLoading) {
    return <LoaderLesson />;
  }

  if (isError) {
    navigate(-1);
    return;
  }

  return (
    <>
      <fieldset className="grid gap-6 rounded-lg border p-4 ">
        <legend className="-ml-1 px-1 text-sm font-medium">{data?.name}</legend>
        <div className="flex justify-between">
          <div className="text-sm">
            <p className="">
              {t("status", { ns: "group" })}:{" "}
              <span className="text-red-800 font-medium">
                {t(data?.status ? data?.status : "", { ns: "status" })}
              </span>
            </p>
            {data?.group && (
              <p>
                {t("group", { ns: "groups" })}:{" "}
                <Link
                  to={`/groups/${data?.group.id}`}
                  className="text-primary font-medium"
                >
                  {data?.group?.name}
                </Link>
              </p>
            )}
          </div>
          {toAuthRoleCheck(user.role, ["CEO", "admin", "manager"]) &&
          data?.status !== "completed" &&
          data?.status !== "waitingConfirm" ? (
            <Dialog open={isModal}>
              <DialogTrigger asChild>
                <Button
                  className="text-white "
                  onClick={() => setIsModal(true)}
                  size="sm"
                >
                  {t("update", { ns: "lessons" })}
                </Button>
              </DialogTrigger>
              <DialogContent
                onInteractOutside={() => setIsModal(false)}
                hideCloseClick={() => setIsModal(false)}
              >
                <DialogHeader>
                  <DialogTitle>{t("update", { ns: "lessons" })}</DialogTitle>
                </DialogHeader>
                <StatusLessonForm
                  id={id}
                  submitForm={statusPost}
                  isLoading={statusData.isLoading}
                  setModal={() => setIsModal(false)}
                  defoutTime={{ startTime: "", endTime: "" }}
                  inivateValue={{
                    status: data?.status || "",
                    mentorId: data?.mentorId ? data?.mentorId.toString() : "",
                    comment: "",
                    startTime: data?.startTime || "14:00",
                    endTime: data?.endTime || "15:00",
                    date: data?.date || new Date(),
                  }}
                />
              </DialogContent>
            </Dialog>
          ) : (
            ""
          )}
        </div>
        <div className="text-sm">
          <p>{data?.date ? new Date(data?.date).toLocaleDateString() : ""}</p>
          <p>
            {t("time", { ns: "groups" })}: {data?.startTime} - {data?.endTime}
          </p>
        </div>
        <div className="flex flex-col text-sm">
          <p>
            {t("comment", { ns: "groups" })}:{" "}
            {data?.comment || t("no.comment", { ns: "groups" })}
          </p>
          {data?.mentor && (
            <p>
              {t("mentor", { ns: "groups" })}:{" "}
              {data?.mentorId && (
                <Link
                  to={`/mentors/${data?.mentorId}`}
                  className="text-primary"
                >
                  {data?.mentor.user.fio}
                </Link>
              )}
            </p>
          )}
          <p>
            {t("responsibleId", { ns: "student" })}:{" "}
            <Link to={`/staffs/${1}`} className="text-primary">
              {data?.responsible.fio || t("admin", { ns: "group" })}
            </Link>
          </p>
        </div>
      </fieldset>
      {data?.group && (
        <fieldset className="grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("students", { ns: "nav" })}
          </legend>
          <div className="flex justify-between align-middle ">
            <div className="flex pt-2">
              {t("checkStudents", { ns: "lessons" })}
            </div>
            {(user.role.includes("CEO") ||
              user.id === data.mentor.userId ||
              user.id === data.responsibleId) &&
            data?.status !== "completed" &&
            data?.students?.length > 0 ? (
              <Link to={`/lessons/${data.id}/check`}>
                <Button size="sm" className="text-xs">
                  {t("checkStudents", { ns: "lessons" })}
                </Button>
              </Link>
            ) : (
              ""
            )}
          </div>
          {data.students.length === 0 ? (
            <NoItems head={t("noItem", { ns: "group" })} />
          ) : (
            <table className="w-full rounded-lg text-xs">
              <thead className="rounded-lg">
                <tr className="border border-gray-300 ">
                  <th className="text-left pl-2  pr-2 w-8 py-[12px]">№</th>
                  <th className=" px-4 text-left ">
                    {t("fio", { ns: "lessons" })}
                  </th>
                  <th className=" px-4  text-left ">
                    {t("phone", { ns: "lessons" })}
                  </th>
                  {data?.status === "completed" && (
                    <th className="py-2 px-4 text-right">
                      {t("inClass", { ns: "lessons" })}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.students.map((student, index: any) => (
                  <tr
                    key={student.studentId}
                    className="border-[1px] border-gray-300"
                  >
                    <td className="py-[12px] pl-2 ">{index + 1}</td>

                    <td className="py-2 px-4 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                      <Link to={`/students/${student.student.id}`}>
                        {student.student.fio}
                      </Link>
                    </td>

                    <td className="py-2 px-4 ">
                      {formatPhoneNumber(student.student.phone)}
                    </td>
                    {data?.status === "completed" && (
                      <td className="py-2 px-4 flex justify-end">
                        {student.attended ? (
                          <CircleCheckBig className="text-green-800" />
                        ) : student.reason === "askedOff" ? (
                          <Speech className="text-gray-950" />
                        ) : student.reason === "gotSick" ? (
                          <Syringe className="text-red-500" />
                        ) : (
                          <CircleX className="text-red-700 " />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </fieldset>
      )}
    </>
  );
};
