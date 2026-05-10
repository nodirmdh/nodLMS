import { Link, useParams } from "react-router-dom";
import { useGetOneExamQuery } from "@/app/store/services/test.service";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePostExamBanchMutation } from "@/app/store/services/test.service";
import { useToast } from "@/components/ui/use-toast";
import { ButtonLoading } from "@/components/ui/loading-button";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export const ExamView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data } = useGetOneExamQuery(id as string);
  const { t } = useTranslation(["group", "group.info"]);
  const [postRezult, postData] = usePostExamBanchMutation();
  const [rezults, setRezults] = useState<
    {
      studentId: number;
      grade: number | undefined;
      comment: string;
    }[]
  >([]);
  useEffect(() => {
    if (data?.grades) {
      if (data.grades.length > 0) {
        const initialRezults = data.grades.map((el) => ({
          studentId: el.studentId,
          grade: el.grade,
          comment: el.comment,
        }));
        return setRezults(initialRezults);
      }
    }
    if (data?.group?.groupStudents) {
      const initialRezults = data.group.groupStudents.map((el) => ({
        studentId: el.student.id,
        grade: 0,
        comment: "",
      }));
      setRezults(initialRezults);
    }
  }, [data]);

  const handleInputChange = (
    index: number,
    field: "grade" | "comment",
    value: string
  ) => {
    let newValue = value;
    if (field === "grade") {
      newValue = value.replace(/^0+/, ""); // олдидаги 0ларни олиб ташлаш
      newValue = newValue === "" ? "0" : newValue; // агар бўш бўлса, 0 га ўрнатиш
    }
    const updatedRezults = rezults.map((result, i) =>
      i === index
        ? {
            ...result,
            [field]: field === "grade" ? Number(newValue) : newValue,
          }
        : result
    );
    setRezults(updatedRezults);
  };
  const examRezultSave = () => {
    if (id) {
      postRezult({
        id: id,
        data: rezults.map((el) => {
          return {
            ...el,
            grade: el.grade ? el.grade : 0,
          };
        }),
      })
        .then((res) => {
          if (res) {
            navigate("/exams");
            toast({
              title: t("success", { ns: "common" }),
              description: "",
            });
          }
        })
        .catch(() => {
          return toast({
            title: t("success", { ns: "common" }),
            description: "",
          });
        });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between flex-col md:flex-row">
        <h4 className="pb-1 text-xl font-semibold tracking-tight first:mt-0">
          {t("Exam", { ns: "exams" })} - {data?.name}
        </h4>
        <Link to={`/exams/update/${data?.id}`}>
          <Button size="sm" className="w-full">
            {t("edit", { ns: "common" })}
          </Button>
        </Link>
      </div>
      <div className="mt-2 flex flex-col w-full">
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("data", { ns: "exams" })}
          </legend>
          <div className="grid gap-y-4">
            <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 xs:grid-cols-2 gap-4 border-b pb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("groupId", { ns: "role" })}
                </p>
                <p className="text-sm font-medium leading-none">
                  {
                    <Link to={`/groups/${data?.group.id}`}>
                      {data?.group.name}
                    </Link>
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("status")}</p>
                <p className="text-sm font-medium leading-none">
                  {t(data?.status ? data?.status : "", { ns: "status" })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("date", { ns: "student" })}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.date ? format(data?.date, "dd.MM.yyyy") : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("comment")}</p>
                <p className="text-sm font-medium leading-none">
                  {`${data?.comments}`}
                </p>
              </div>
            </div>
            <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 xs:grid-cols-2 gap-4 border-b pb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("startTime")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.group.startTime}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("endTime")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.group.endTime}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("responsible")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {
                    <Link to={`/staffs/${data?.responsible.id}`}>
                      {data?.responsible.fio}
                    </Link>
                  }
                </p>
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("data")}
          </legend>

          <table className="border w-full table-auto rounded-lg text-xs">
            <thead className="rounded-lg">
              <tr>
                <th className="px-4 py-2 text-left font-semibold ">
                  {t("fio")}
                </th>
                <th className="px-4 py-2 text-left font-semibold ">
                  {t("result")}
                </th>
                <th className="px-4 py-2 text-left font-semibold ">
                  {t("comment")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.group.groupStudents.map((el, index) => (
                <tr key={el.student.id} className="border-t-[1px] text-xs">
                  <td className="px-4 py-4 text-sm">
                    <Link to={`/students/${el.student.id}`}>
                      {el.student.fio}
                    </Link>
                  </td>
                  <td>
                    <Input
                      type="number"
                      min="1"
                      className="w-[70px] text-xs p-1"
                      value={rezults[index]?.grade || ""}
                      placeholder="0"
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value) {
                          value = value.replace(/^0+/, "");
                        }
                        handleInputChange(index, "grade", value);
                      }}
                    />
                  </td>
                  <td>
                    <Input
                      placeholder={t("comment")}
                      className="text-xs"
                      value={rezults[index]?.comment || ""}
                      onChange={(e) =>
                        handleInputChange(index, "comment", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="w-full">
            <ButtonLoading
              className=""
              onClick={examRezultSave}
              size="sm"
              isLoading={postData.isLoading}
            >
              {t("save", { ns: "exams" })}
            </ButtonLoading>
          </div>
        </fieldset>
      </div>
    </div>
  );
};
