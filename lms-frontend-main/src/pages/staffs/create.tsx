import { useCreateUserMutation } from "@/app/store/services/user.service";
import { StaffForm } from "@/features/staff-form";

export const CreateStaffPage = () => {
  const [createUser,{isLoading}] = useCreateUserMutation();
  return (
    <StaffForm
      type="create"
      initialValues={{
        fio: "",
        phone: "",
        phoneSecond: "",
        documentSeries: "",
        documentNo: "",
        role: [],
        salaryMentorType: "",
        salaryMentor:"",
        telegram: "",
        sex: "",
        birthday: "",
        socialStatus: "",
        education: "",
        familyStatus: "",
        address: "",
        cardNo: "",
        cardPlaceholder: "",
        branches: [],
        salary:"",
        avatar:""
      }}
      submitForm={createUser}
      isLoading={isLoading}
    />
  );
};
