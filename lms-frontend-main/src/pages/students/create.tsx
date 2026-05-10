import { StudentForm } from "@/features/student-form/student-form";
import { usePostStudentsMutation } from "@/app/store/services/student.service";
export const CreateStudent = () => {
  const [createStudent, { isLoading }] = usePostStudentsMutation();
  return (
    <StudentForm
      type="create"
      initialValues={{
        avatar: "",
        birthday: "",
        disability: "",
        fatherFio: "",
        fatherJob: "",
        fatherPhone: "",
        fio: "",
        montherFio: "",
        montherJob: "",
        montherPhone: "",
        phone: "",
        sex: "",
        telegram: "",
        groups: [],
      }}
      submitForm={createStudent}
      isLoading={isLoading}
    />
  );
};
