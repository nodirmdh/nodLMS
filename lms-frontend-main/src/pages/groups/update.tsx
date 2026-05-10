import { useEffect } from "react";
import {
  useEditGroupMutation,
  useGetGroupQuery,
  IPostGroup,
} from "@/app/store/services/groups.service";
import { GroupForm } from "@/features/group-form";
import { useNavigate, useParams } from "react-router-dom";
export const UpdateGroupPage = () => {
  const navigate = useNavigate();
  const [editGroup,editData] = useEditGroupMutation();
  const { id } = useParams<string>();
  const { data, isLoading, refetch } = useGetGroupQuery(id as string);
  const onSubmit: (values: IPostGroup) => Promise<any> = async (
    values: IPostGroup
  ) => {
    if (data) {
      const respons = await editGroup({ data: values, id: data.id });
      return respons;
    }
    return;
  };

  useEffect(() => {
    refetch();
  }, []);

  if ((!isLoading && !data) || !id) {
    navigate(-1);
    return null;
  }
  if (!data) {
    return <></>;
  }

  return (
    <GroupForm
      type={"update"}
      initialValues={{
        name: data.name,
        courseId: `${data.courseId}`,
        classDays: data.classDays,
        startTime: data.startTime,
        endTime: data.endTime,
        date: {
          from: new Date(data.fromDate),
          to: new Date(data.toDate),
        },
        diabledValue: data.lastLessonDate,
        mentorId: `${data.mentorId}`,
        responsibleId: `${data.responsibleId}`,
        type: data.status,
      }}
      submitForm={onSubmit}
      isLoading={editData.isLoading}
    />
  );
};
