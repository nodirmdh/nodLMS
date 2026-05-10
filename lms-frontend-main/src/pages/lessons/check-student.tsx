import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetLessonQuery } from "@/app/store/services/schedule.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { RootState } from "@/app/store/store.config";
import {
  useCheckAttendanceMutation,
  useCheckStudentConfirmMutation,
} from "@/app/store/services/schedule.service";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPhoneNumber, toAuthRoleCheck } from "@/lib/utils";
import { ButtonLoading } from "@/components/ui/loading-button";
import { NoItems } from "@/components/no-items/no-items";
import {
  Select as SelectUI,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IDataStudent {
  studentId: number;
  attended: boolean;
  reason?: string;
  discount: number | null;
  student: {
    fio: string;
    phone: string;
    mother?: {
      fio: string;
      phone: string;
    };
    father?: {
      fio: string;
      phone: string;
    };
  };
}
const CheckStudent: FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation("group");
  const { data, isLoading } = useGetLessonQuery(id as string);
  const [students, setStudents] = useState<IDataStudent[]>([]);
  const [checkResponsibel, checkLessonData] = useCheckStudentConfirmMutation();
  const [checkStudents, checkStudentData] = useCheckAttendanceMutation();
  const user = useSelector((state: RootState) => state.userState);
  const handleCheckboxChange = (
    index: number,
    checked: boolean,
    studentId: number
  ) => {
    setStudents((prev) => {
      const newUserDate = [...prev];
      newUserDate[index] = {
        ...newUserDate[index],
        attended: checked,
        studentId: studentId,
      };
      return newUserDate;
    });
  };

  const handleAttendedChange = (
    index: number,
    studentId: number,
    reason: string
  ) => {
    setStudents((prev) => {
      const newUserDate = [...prev];
      newUserDate[index] = {
        ...newUserDate[index],
        studentId,
        reason,
      };
      return newUserDate;
    });
  };

  const hedleclick = (id: string | undefined) => {
    if (
      id &&
      (data?.mentor.userId === user.id ||
        data?.responsibleId === user.id ||
        toAuthRoleCheck(user.role, ["CEO"]))
    ) {
      ((data?.status === "waiting" || data?.status === "waitingConfirm") &&
        user.id === data?.mentor?.userId) ||
      (data?.status === "waiting" &&
        (user.id === data?.mentor?.userId ||
          user.id === data?.responsibleId ||
          toAuthRoleCheck(user.role, ["CEO"])))
        ? checkStudents({ id: id, data: students })
            .then(() => {
              navigate(-1);
              toast({
                title: t("success", { ns: "common" }),
                description: `${t(`success`, {
                  ns: "common",
                })}`,
              });
            })
            .catch((e: any) =>
              toast({
                title: t("error", { ns: "common" }),
                description: `${t(`error.`, {
                  ns: "common",
                })} ${e}}`,
                variant: "destructive",
              })
            )
        : checkResponsibel({ id: id, data: students })
            .then(() => {
              navigate(-1);
              toast({
                title: t("success", { ns: "common" }),
                description: `${t(`success`, {
                  ns: "common",
                })}`,
              });
            })
            .catch((e: any) =>
              toast({
                title: t("error", { ns: "common" }),
                description: `${t(`error.`, {
                  ns: "common",
                })} ${e}}`,
                variant: "destructive",
              })
            );
    }
  };

  useEffect(() => {
    if (data?.students) {
      setStudents([]);
      data.students.forEach((el: any) => {
        setStudents((prev) => {
          return [
            ...prev,
            {
              studentId: el.studentId,
              attended:
                el.attended === true || el.attended === false
                  ? el.attended
                  : true,
              discount: el.discount,
              student: { fio: el.student.fio, phone: el.student.phone },
              mother: el.student.montherPhone && {
                phone: el.student.montherPhone,
                fio: el.student.montherFio,
              },
              father: el.student.fatherPhone && {
                phone: el.student.fatherPhone,
                fio: el.student.fatherFio,
              },
              reason: el.attended === true ? el.reason : "unknown",
            },
          ];
        });
      });
    }
  }, [data?.students]);

  if (isLoading) {
    return <div>{t("loading", { ns: "lessons" })}</div>;
  }

  if (data?.students.length === 0) {
    return <NoItems head={t("noItem", { ns: "group" })} />;
  }
  return (
    <section>
      <div className="py-3">
        <h2 className="">{t("checkStudent", { ns: "lessons" })}</h2>
      </div>
      {data?.group && (
        <div className="w-full overflow-auto">
          <table className="min-w-full rounded-lg text-sm overflow-x-auto ">
            <thead className="rounded-lg">
              <tr className="border border-gray-300  text-[12px]">
                <th className="text-left pl-2 py-[12px]">№</th>
                <th className="px-4 text-left py-[12px] w-64">
                  {t("fio", { ns: "lessons" })}
                </th>
                <th className="px-4 text-left py-[12px]">
                  {t("phone", { ns: "lessons" })}
                </th>
                <th className="py-2 px-4 border-b-2 text-left">
                  {t("check", { ns: "lessons" })}
                </th>
                {data.status !== "waiting" &&
                  (user.role.includes("CEO") ||
                    user.id === data.responsibleId) && (
                    <th className="py-2 px-4  text-left ">
                      {t("reason", { ns: "lessons" })}
                    </th>
                  )}
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map(({ student, studentId, attended }, index) => (
                  <tr
                    key={index}
                    className="border-[1px] border-gray-300 text-[12px]"
                  >
                    <td className="text-left pl-2 w-8 py-[14px] text-sm">
                      {index + 1}
                    </td>
                    <td className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {student.fio}
                    </td>
                    <td className="px-4 text-left">
                      {formatPhoneNumber(student.phone)}
                    </td>
                    <td className="px-4 text-left w-[40px]">
                      <div className="flex items-center">
                        <Checkbox
                          checked={attended}
                          className="bg-secondary"
                          disabled={
                            !(
                              ((data.status === "waiting" ||
                                data.status === "waitingConfirm") &&
                                user.role.includes("CEO")) ||
                              user.id === data.mentor.userId ||
                              user.id === data.responsibleId
                            )
                          }
                          id={`attended-${index}`}
                          onCheckedChange={(checked) => {
                            if (
                              ((data.status === "waiting" ||
                                data.status === "waitingConfirm") &&
                                user.role.includes("CEO")) ||
                              user.id === data.mentor.userId ||
                              user.id === data.responsibleId
                            ) {
                              handleCheckboxChange(
                                index,
                                checked ? true : false,
                                studentId
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    {data.status !== "waiting" &&
                      (user.role.includes("CEO") ||
                        user.id === data.responsibleId) && (
                        <td className="py-1 px-4 text-left">
                          <div className="p-2 min-w-[70px] w-full max-w-[70px] md:min-w-[154px] md:max-w-[154px]">
                            <SelectUI
                              onValueChange={(item) =>
                                handleAttendedChange(index, studentId, item)
                              }
                              disabled={attended}
                            >
                              <SelectTrigger className="w-full px-1">
                                <SelectValue
                                  placeholder={t("choose", { ns: "lessons" })}
                                  className="w-full px-1"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {[
                                    {
                                      value: "gotSick",
                                      label: t("sick", { ns: "groups" }),
                                    },
                                    {
                                      value: "askedOff",
                                      label: t("asked", { ns: "groups" }),
                                    },
                                    {
                                      value: "unknown",
                                      label: t("unknown", { ns: "groups" }),
                                    },
                                  ].map((option, index) => (
                                    <SelectItem
                                      key={index}
                                      value={String(option.value)}
                                    >
                                      {t(option.label)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </SelectUI>
                          </div>
                        </td>
                      )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td>{t("noStudents", { ns: "lessons" })}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="gap-16 flex py-2 w-2/3">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          type="button"
          className="w-1/2"
          size="sm"
        >
          {t("cancel")}
        </Button>
        <ButtonLoading
          isLoading={checkLessonData.isLoading || checkStudentData.isLoading}
          onClick={() => hedleclick(id)}
          className="w-1/2 "
          size="sm"
        >
          {t("save")}
        </ButtonLoading>
      </div>
    </section>
  );
};

export { CheckStudent };
