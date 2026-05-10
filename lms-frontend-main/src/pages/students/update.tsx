import {
  useGetStudentQuery,
  usePutStudentsMutation,
} from "@/app/store/services/student.service";
import { StudentForm } from "@/features/student-form/student-form";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ICreateStudent } from "@/common/types/students.interface";

export const UpdateStudentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch, isSuccess } = useGetStudentQuery(
    id as string
  );
  const [updateStudent, update] = usePutStudentsMutation();
  if (!isLoading && !data) {
    navigate(-1);
  }

  useEffect(() => {
    refetch();
  }, []);
  if (!isSuccess) {
    return <></>;
  }

  const submitForm = (values: ICreateStudent) => {
    if (id) {
      return updateStudent({ data: values, id: id });
    }
    return update.data;
  };
  return (
    <StudentForm
      type="update"
      initialValues={{
        avatar: data.avatar || "",
        birthday: data?.birthday || "",
        disability: data?.disability?.toString() || "",
        fatherFio: data?.fatherFio || "",
        fatherJob: data?.fatherJob || "",
        fatherPhone: data?.fatherPhone || "",
        fio: data?.fio || "",
        montherFio: data?.montherFio || "",
        montherJob: data?.montherJob || "",
        montherPhone: data?.montherPhone || "",
        phone: data?.phone || "",
        sex: data?.sex || "",
        telegram: data?.telegram || "",
        pinfl: data.pinfl || "",
        documentSeries: data.documentSeries || "",
        documentNo: data.documentNo || "",
        groups: data.groupStudents
          .filter((item) => item.status !== "stopped")
          .map((item) => ({
            groupId: item.groupId.toString(),
            discount: item.discount || 0,
            discountComment: item.discountComment || "",
            name: item.group.name,
          })),
      }}
      submitForm={submitForm}
      isLoading={isLoading}
    />
  );
};
