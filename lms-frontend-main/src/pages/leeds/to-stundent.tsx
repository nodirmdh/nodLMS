import { useGetLeedQuery } from "@/app/store/services/leeds.service";
import { usePostStudentsMutation } from "@/app/store/services/student.service";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudentForm } from "@/features/student-form";
export const LeedToStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams<string>();
  const { data, refetch } = useGetLeedQuery(id as string);
  const [createStudent, {isLoading}] = usePostStudentsMutation();
  useEffect(() => {
    refetch();
  }, []);

  if ((!data) || !id) {
    navigate(-1);
    return null;
  }


  return (
    <div className="flex justify-start">
      <div className=" bg-white p-8 w-full max-w-4xl">
        <StudentForm
          type="create"
          initialValues={{
            leadId:data?data.id:0,
            fio: data?data.fio:"",
            phone: data?data.phone:"",
            birthday: "",
            disability: "",
            fatherFio: "",
            fatherJob: "",
            fatherPhone: "",
            montherFio: "",
            montherJob: "",
            montherPhone: "",
            sex: "",
            telegram: "",
            groups: [],
          }}
          submitForm={createStudent}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
