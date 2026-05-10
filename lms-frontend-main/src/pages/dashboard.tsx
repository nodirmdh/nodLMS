import { Schedule } from "@/features/schedule";
import { addDays, format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { CreateLessonForm } from "@/features/create-lesson-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { useGetLessonsByDateQuery } from "@/app/store/services/schedule.service";
import { usePostLessonOneMutation } from "@/app/store/services/lessons.service";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
import { toAuthRoleCheck } from "@/lib/utils";
import { lessonRole } from "@/components/layout/links/links";
import { useSearchParams } from "react-router-dom";
export interface Event {
  id: number;
  name: string;
  course: string;
  startTime: string;
  endTime: string;
  group: any;
  responsible: any;
  mentor: any;
  status: string;
}

export default function Dashboard() {
  const { t } = useTranslation("lessons");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(
    new Date(searchParams.get("date") || new Date())
  );
  const [oneLessonsPost, postLoading] = usePostLessonOneMutation();
  const [lessonData, setLessonData] = useState<any[]>([]);
  const [isModal, setIsModal] = useState<boolean>(false);
  const { role } = useSelector((state: RootState) => state.userState);
  const { data, isSuccess, isLoading, refetch } = useGetLessonsByDateQuery(
    new Date(selectedDate).setUTCHours(0, 0, 0, 0)
  );

  const handleDate = (type: "prev" | "next") => {
    const newDate =
      type === "prev" ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
    setSearchParams({ date: format(newDate, "yyyy-MM-dd") });
  };
  useEffect(() => {
    setLessonData(data);
  }, [data]);

  useEffect(() => {
    setLessonData([]);
    refetch();
  }, [selectedDate]);

  return (
    <>
      <div className="flex items-center pb-2 pt-2">
        <h2 className="font-bold tracking-tight">
          {t("dashboard", { ns: "nav" })}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {toAuthRoleCheck(role, lessonRole) ? (
            <Dialog open={isModal}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setIsModal(true)}>
                  {t("create")}
                </Button>
              </DialogTrigger>
              <DialogContent
                className="w-[min(100%-20px,550px)] rounded-md"
                onInteractOutside={() => setIsModal(false)}
                hideCloseClick={() => setIsModal(false)}
              >
                <DialogHeader>
                  <DialogTitle>{t("dashTitle")}</DialogTitle>
                </DialogHeader>
                <CreateLessonForm
                  submitForm={oneLessonsPost}
                  isLoading={postLoading.isLoading}
                  closeModal={() => setIsModal(false)}
                  refetch={refetch}
                />
              </DialogContent>
            </Dialog>
          ) : (
            ""
          )}
        </div>
      </div>
      {isLoading ? (
        <Schedule
          prevDate={format(subDays(selectedDate, 1), "dd MMM").toString()}
          date={format(selectedDate, "dd MMM yyyy").toString()}
          nextDate={format(addDays(selectedDate, 1), "dd MMM").toString()}
          handleDate={handleDate}
          events={[]}
        />
      ) : (
        isSuccess && (
          <Schedule
            prevDate={format(subDays(selectedDate, 1), "dd MMM").toString()}
            date={format(selectedDate, "dd MMM yyyy").toString()}
            nextDate={format(addDays(selectedDate, 1), "dd MMM").toString()}
            handleDate={handleDate}
            events={lessonData}
          />
        )
      )}
    </>
  );
}
