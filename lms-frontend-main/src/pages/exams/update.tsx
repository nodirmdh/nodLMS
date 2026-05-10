import { TestForm } from "@/features/test-form";
import {
  IPostExam,
  useGetOneExamQuery,
  usePatchExamMutation,
} from "@/app/store/services/test.service";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
export const UpDateExam = () => {
  const { id } = useParams();
  const { t }=useTranslation("lessons")
  const [postExam, { isLoading }] = usePatchExamMutation();
  const { data, isSuccess } = useGetOneExamQuery(id as string);

  const onSubmit = async (value: IPostExam) => {
    if (id) {
      await postExam({ data: value, id: id });
    }
    return { data: { title: "ozgerdi" } };
  };

  return (
    <>
      {isSuccess ? (
        <TestForm
          type="UPDATE"
          grouptype={["waiting","active"]}
          initialValues={{
            name: data?.name ? data?.name : "",
            date: data?.date ? data?.date : new Date(),
            groupId: `${data?.groupId}`,
            responsibleId: `${data?.responsibleId}`,
            comments: data?.comments,
          }}
          submitForm={onSubmit}
          isLoading={isLoading}
        />
      ) : (
        t("loading")
      )}
    </>
  );
};
