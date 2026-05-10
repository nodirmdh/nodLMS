import { useEffect, useState } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select as SelectUI,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { ButtonLoading } from "@/components/ui/loading-button";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
  IJurnal,
  useGetGroupQuery,
  useGetJurnalQuery,
} from "@/app/store/services/groups.service";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  Speech,
  Syringe,
} from "lucide-react";
import {
  useCheckAttendanceMutation,
  useCheckStudentConfirmMutation,
} from "@/app/store/services/schedule.service";
import { toast } from "@/components/ui/use-toast";

const formatMonthYear = (date: Date): string => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month.toString().padStart(2, "0")}.${year}`;
};

export const Jurnal = () => {
  const { id } = useParams<string>();
  const [date, setDate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const groupInfo = useGetGroupQuery(id as string);
  const jurnalData = useGetJurnalQuery({
    id: id as string,
    date: formatMonthYear(date),
  });
  const [data, setData] = useState<IJurnal | undefined>(undefined);
  const { t } = useTranslation();
  const [selectedLessons, setSelectedLessons] = useState<number | null>(null);
  const [statusLesson, setLessonStatus] = useState("");
  const [checked, setChecked] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [checkResponsibel] = useCheckStudentConfirmMutation();
  const [checkStudents] = useCheckAttendanceMutation();

  const handleDate = (action: "prev" | "next") => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (action === "prev") {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else if (action === "next") {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const prevDate = new Date(date);
  prevDate.setMonth(date.getMonth() - 1);

  const nextDate = new Date(date);
  nextDate.setMonth(date.getMonth() + 1);

  useEffect(() => {
    //@ts-ignore
    setData(jurnalData.data);
    setStudents(
      jurnalData.data
        ? jurnalData.data.students?.map((el) => ({
            studentId: el.id,
            attended:
              el?.attended?.filter((item) => item.id === selectedLessons)[0]
                ?.attendend ?? true,
            //@ts-ignore
            reason: el.reason ? el.reason : null,
          }))
        : []
    );
    setLessonStatus("");
    setSelectedLessons(null);
    setChecked(false);
  }, [jurnalData.data]);

  const handleCheckboxChange = (
    checked: boolean,
    id: number,
    status: string
  ) => {
    setSelectedLessons(id);
    setChecked(checked);
    setLessonStatus(status);
  };

  const handleReasonChange = (index: number, reason: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student, idx) =>
        idx === index ? { ...student, reason } : student
      )
    );
  };

  const jurnalSubmit = () => {
    if (statusLesson === "waitingConfirm") {
      //@ts-ignore
      checkResponsibel({ id: selectedLessons as number, data: students }).then(
        () => {
          jurnalData.refetch();
        }
      );
    }
    if (statusLesson === "waiting") {
      //@ts-ignore
      checkStudents({ id: selectedLessons as number, data: students }).then(
        () => {
          toast({
            title: t("success", { ns: "common" }),
            description: `${t(`success`, {
              ns: "common",
            })}`,
          });
          navigate(-1);
          jurnalData.refetch();
        }
      );
    }
  };

  console.log(students);

  return (
    <section>
      <div>
        <div className="flex items-center xs: flex-col md:flex-row">
          <h4 className="pb-1 text-xl font-semibold tracking-tight first:mt-0">
            {t("name")} - {groupInfo.data?.name}
          </h4>
        </div>
      </div>
      <div className="calendar-header flex items-center justify-between border-t-[1px] border-r-[1px] border-l-[1px] px-1 py-1 text-sm">
        <button
          onClick={() => handleDate("prev")}
          className="flex items-center"
        >
          <ChevronLeft />
          <span className="ml-2">{formatMonthYear(prevDate)}</span>
        </button>
        <span className="text-base font-semibold">{formatMonthYear(date)}</span>
        <button
          onClick={() => handleDate("next")}
          className="flex items-center"
        >
          <span className="mr-2">{formatMonthYear(nextDate)}</span>
          <ChevronRight />
        </button>
      </div>
      <div className="overflow-x-scroll overflow-y-scroll max-h-[80vh]">
        <table className="border border-1 overflow-auto text-sm w-full">
          <TableHeader className="border-b-1">
            <TableRow>
              <TableHead className="border-r-[1px]">№</TableHead>
              <TableHead className="border-r-[1px]">FIO</TableHead>
              {data?.lessons?.map((el) => (
                <TableHead
                  key={el.date}
                  className={`border-r-[1px] ${
                    el.status === "waitingConfirm" ? "bg-orange-100" : ""
                  }`}
                >
                  <div className="flex gap-1 items-center pr-3">
                    {el.date}
                    {!el.checked && (
                      <Checkbox
                        checked={checked && selectedLessons === el.id}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            checked ? true : false,
                            el.id,
                            el.status
                          )
                        }
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="max-h-[60vh]">
            {data?.students.map((student, index) => (
              <TableRow key={index}>
                <TableCell className="border-b-[1px] border-r-[1px]">
                  {index + 1}
                </TableCell>
                <TableCell className="border-r-[1px]">{student.fio}</TableCell>
                {student.attended?.map((el, idx) => (
                  <TableCell
                    key={idx}
                    className="border-b-[1px] border-r-[1px]"
                  >
                    {el.checked ? (
                      <>
                        <td className="py-2 px-4 flex justify-end">
                          {el.attendend ? (
                            <CircleCheckBig className="text-green-800" />
                          ) : el.reason === "askedOff" ? (
                            <Speech className="text-gray-950" />
                          ) : el.reason === "gotSick" ? (
                            <Syringe className="text-red-500" />
                          ) : (
                            <CircleX className="text-red-700 " />
                          )}
                        </td>
                      </>
                    ) : (
                      <div className="flex gap-1 items-center pr-3">
                        <Checkbox
                          disabled={
                            checked && el.id === selectedLessons ? false : true
                          }
                          checked={
                            students[index]?.attended &&
                            el.id === selectedLessons
                          }
                          onCheckedChange={(checked) => {
                            console.log("isledim");
                            setStudents((prevStudents) =>
                              prevStudents.map((student, studentIndex) =>
                                studentIndex === index &&
                                el.id === selectedLessons
                                  ? { ...student, attended: checked }
                                  : student
                              )
                            );
                          }}
                        />
                        {students[index]?.attended && el.id === selectedLessons
                          ? ""
                          : el.id === selectedLessons && (
                              <SelectUI
                                onValueChange={(value) =>
                                  handleReasonChange(index, value)
                                }
                                value={students[index].reason}
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
                                    ].map((option, idx) => (
                                      <SelectItem
                                        key={idx}
                                        value={option.value}
                                      >
                                        {t(option.label)}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </SelectUI>
                            )}
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
      <div className="mt-5">
        <ButtonLoading
          className="bg-primary"
          size="sm"
          onClick={() => jurnalSubmit()}
        >
          Submit
        </ButtonLoading>
      </div>
    </section>
  );
};
