import { TestForm } from "@/features/test-form";
import { usePostExamMutation } from "@/app/store/services/test.service";
export const CreateExam = () => {
  const [postExam, { isLoading }] = usePostExamMutation();
  return (
    <TestForm
      type="CREATE"
      grouptype={["waiting","active"]}
      initialValues={{
        name: "",
        date: new Date(),
        groupId: "",
        responsibleId: "",
        comments: "",
      }}
      submitForm={postExam}
      isLoading={isLoading}
    />
  );
};
