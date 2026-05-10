import { useCreateGroupMutation } from "@/app/store/services/groups.service";
import { GroupForm } from "@/features/group-form";

export const CreateGroupPage = () => {
  const [createGroup,{isLoading}] = useCreateGroupMutation();
  return (
    <GroupForm
      type={"create"}
      initialValues={{
        courseId: "",
        name: "",
        date: {
          from:new Date(),
          to: new Date(new Date().setDate(new Date().getDate() + 30))
        },
        mentorId: "",
        startTime: "14:00",
        endTime: "15:00",
        classDays: ["odd"],
        diabledValue:""
      }}
      submitForm={createGroup}
      isLoading={isLoading}
    />
  );
};
