import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import {
  useGetStudentQuery,
  useBonusStudentMutation,
  useDeleateBonusStudentMutation,
} from "@/app/store/services/student.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Trash2, Loader, MoreVertical } from "lucide-react";
import { NoItems } from "@/components/no-items/no-items";
import { Table } from "@/components/table";
import { formatDate, formatPhoneNumber, toAuthRoleCheck } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useCreateTransactionMutation } from "@/app/store/services/accounting.service";
import { useGetMentorsProssentSelectQuery } from "@/app/store/services/mentor.service";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { StudentTrasactionForm } from "@/features/student-trasaction-form";
import { StudentBonusForm } from "@/features/student-bonus-form";
import { format } from "date-fns";

export const ViewStudent = () => {
  const { id } = useParams<string>();
  const role = useSelector((state: RootState) => state.userState.role);
  const { toast } = useToast();
  const { data, refetch } = useGetStudentQuery(id as string);
  const [isModal, setIsModal] = useState(false);
  const [bonusId, setBonusId] = useState<number | null>(null);
  const [bonusModal, setBonusModal] = useState(false);
  const { t } = useTranslation("student");
  const [postTransaction, postDataTransaction] = useCreateTransactionMutation();
  const [bonusPost, bonusPostData] = useBonusStudentMutation();
  const [deleteBonus, deleteData] = useDeleateBonusStudentMutation();
  const mentors = useGetMentorsProssentSelectQuery();
  const clickDelete = (id: number) => {
    setBonusId(id);
    deleteBonus(id)
      .then((res: any) => {
        if (res.data.id) {
          refetch();
          return toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
        return toast({
          title: t("error", { ns: "common" }),
          description: ``,
        });
      })
      .catch(() => {
        toast({
          title: t("error", { ns: "common" }),
          description: ``,
        });
      });
    refetch();
  };
  return (
    <section className="p-3 ">
      <div className="flex flex-col">
        <div className="flex gap-8 py-2 xs:flex flex-col items-center md:flex-row">
          <Avatar className="w-16 h-16 flex justify-center items-center">
            <AvatarImage
              className="rounded-full max-w-full max-h-full"
              src={
                data?.avatar
                  ? `${import.meta.env.VITE_API_URL}${(
                      data.avatar as string
                    ).substring(1)}`
                  : "/assets/images/user.png"
              }
              alt="@shadcn"
            />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>

          <h4 className="pt-1 md:text-xl font-semibold tracking-tight first:mt-0 sm:text-base">
            {data?.fio}
          </h4>
          <div className="xs:mx-auto md:ml-auto block gap-4 md:flex">
            <Dialog open={isModal}>
              <DialogTrigger asChild>
                {toAuthRoleCheck(role, ["CEO", "admin"]) && (
                  <Button
                    className="w-full mb-2 text-sm"
                    variant="outline"
                    onClick={() => setIsModal(true)}
                    size="sm"
                  >
                    {t("vnesti", { ns: "accounting" })}
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent
                hideCloseClick={setIsModal}
                className=" text-sm w-[min(100%-30px,550px)]"
                onInteractOutside={() => setIsModal(false)}
                onEscapeKeyDown={() => setIsModal(false)}
                hideCloseButton={false}
              >
                <StudentTrasactionForm
                  submitForm={postTransaction}
                  fio={data?.fio ? data.fio : ""}
                  defaultValues={{
                    studentId: data?.id ? data?.id : 0,
                    type: "in",
                    amount:
                      data?.balance && data.balance < 0
                        ? `${Math.ceil(0 - data.balance)}`
                        : "",
                    comment: "",
                    paymentType: "",
                    profitType: "payment",
                  }}
                  mentors={mentors.data}
                  isLoading={postDataTransaction.isLoading}
                  closeModal={() => setIsModal(false)}
                  refetch={refetch}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={bonusModal}>
              <DialogTrigger asChild>
                {toAuthRoleCheck(role, ["CEO", "admin"]) && (
                  <Button
                    className="w-full mb-2 text-sm"
                    variant="outline"
                    onClick={() => setBonusModal(true)}
                    size="sm"
                  >
                    {t("CREATE", { ns: "bonus" })}
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent
                hideCloseClick={setBonusModal}
                className=" text-sm w-[min(100%-30px,550px)]"
                onInteractOutside={() => setBonusModal(false)}
                onEscapeKeyDown={() => setBonusModal(false)}
                hideCloseButton={false}
              >
                <StudentBonusForm
                  studentId={id as string}
                  submitForm={bonusPost}
                  fio={data?.fio ? data.fio : ""}
                  defaultValues={{
                    studentId: data?.id ? data?.id : 0,
                    amount:
                      data?.balance && data.balance < 0
                        ? `${Math.ceil(0 - data.balance)}`
                        : "",
                    comment: "",
                  }}
                  isLoading={bonusPostData.isLoading}
                  closeModal={() => setBonusModal(false)}
                  refetch={refetch}
                  mentors={mentors.data}
                />
              </DialogContent>
            </Dialog>
            {toAuthRoleCheck(role, ["CEO", "admin"]) && (
              <Link to={`/students/update/${data?.id}`} className="w-full">
                <Button size="sm" className="w-full">
                  {t("edit", { ns: "common" })}
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-col w-full">
          <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
            <legend className="-ml-1 px-1 text-sm font-medium">
              {t("data")}
            </legend>
            <div className="grid gap-y-4">
              <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-4 border-b pb-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("fio")}</p>
                  <p className="text-sm font-medium leading-none">
                    {data?.fio}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("phone")}</p>
                  <p className="text-sm font-medium leading-none">
                    {data?.phone && formatPhoneNumber(data.phone)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("balance")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.balance
                      ? `${(
                          Math.floor(data.balance / 1000) * 1000
                        ).toLocaleString()} ${t("sum", {
                          ns: "list",
                        })}`
                      : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("birthday")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.birthday
                      ? formatDate(data.birthday)
                      : t("noBirthday", { ns: "nav" })}
                  </p>
                </div>
              </div>
              <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("fatherFio")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.fatherFio}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("fatherPhone")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.fatherPhone && formatPhoneNumber(data?.fatherPhone)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("montherFio")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.montherFio}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("montherPhone")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.montherPhone &&
                      formatPhoneNumber(data?.montherPhone)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("status")}</p>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.status ? data?.status : "", { ns: "status" })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("sex")}</p>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.sex ? data?.sex : "", { ns: "status" })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("documentSeries", { ns: "staff" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.documentSeries ? data?.documentSeries : "", {
                      ns: "staff",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("documentNo", { ns: "staff" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.documentNo ? data?.documentNo : "", {
                      ns: "staff",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("pinfl", { ns: "students" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.pinfl ? data?.pinfl : "", { ns: "students" })}
                  </p>
                </div>
              </div>
            </div>
          </fieldset>
          <div className="flex gap-x-6"></div>
          <h2 className="-ml-1 px-1 text-xl font-medium  p-4 w-full">
            {t("groups", { ns: "groups" })}
          </h2>
          {data?.groupStudents.length === 0 ? (
            <NoItems head={t("noItem", { ns: "group" })} />
          ) : (
            <>
              <Table
                data={data?.groupStudents ? data?.groupStudents : []}
                columns={["name", "startTime", "endTime", "discount"]}
                path={"groups"}
                tag="groups"
                withAction={false}
              />
            </>
          )}

          <h2 className="-ml-1 px-1 text-xl font-medium  p-4 w-full">
            {t("lessons")}
          </h2>

          {data?.lessons.length === 0 ? (
            <NoItems head={t("noItem", { ns: "group" })} />
          ) : (
            <>
              <Table
                data={data?.lessons ? data?.lessons : []}
                columns={["name", "status", "date", "startTime", "attended"]}
                path={"lessons"}
                tag="lessons"
                withAction={false}
              />
            </>
          )}
        </div>
        <div className="grid grid-cols-1 mt-4 gap-8 md:grid-cols-2">
          <fieldset className="grid gap-4 rounded-lg border border-gray-300 px-4 w-full p-6 bg-white shadow-sm">
            <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
              {t("transaction", { ns: "accounting" })}
            </legend>
            <div className="space-y-4 p-2 rounded-md ">
              {data?.transactions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm md:text-base border-b-2 pb-2 last:border-none"
                >
                  <div className="flex items-center ">
                    <div className="ml-3">
                      <p className="font-medium">
                        {format(item.date, "dd.MM.yyyy")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t(item.paymentType, { ns: "accounting" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-righ flex gap-2 items-center">
                    <p
                      className={`font-normal text-sm ${
                        item.amount ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.amount.toLocaleString()} {t("sum", { ns: "list" })}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link
                            to={`/accounting/update/${item.id}`}
                            className="w-full"
                          >
                            {t("edit", { ns: "mentor" })}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
          <fieldset className="grid gap-4 rounded-lg border border-gray-300 px-4 w-full p-6 bg-white shadow-sm">
            <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
              {t("title", { ns: "bonus" })}
            </legend>
            <div className="space-y-4 p-2 rounded-md">
              {data?.bonuses?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm md:text-base border-b-2 pb-2 last:border-none"
                >
                  <div className="flex items-center ">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-input text-base text-black font-bold`}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">
                        {format(item.date, "dd.MM.yyyy")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t(item.name, { ns: "accounting" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p
                      className={`font-normal text-sm ${
                        item.amount ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.amount.toLocaleString()} {t("sum", { ns: "list" })}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="p-2"
                      disabled={deleteData.isLoading && bonusId === item.id}
                      onClick={() => clickDelete(item.id)}
                    >
                      {deleteData.isLoading && bonusId === item.id ? (
                        <Loader className="w-5 h-5" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </section>
  );
};
