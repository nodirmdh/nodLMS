import {
  ILeedBody,
  useGetLeedQuery,
  useUpdateLeedMutation,
} from "@/app/store/services/leeds.service";

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LeedForm } from "@/features/leed-form";
export const UpdateLeedsPage = () => {
  const navigate = useNavigate();
  const [updateLeed] = useUpdateLeedMutation();
  const { id } = useParams<string>();
  const { data, isLoading, refetch } = useGetLeedQuery(id as string);
  useEffect(() => {
    refetch();
  }, []);

  if ((!isLoading && !data) || !id) {
    navigate(-1);
    return null;
  }
  if (!data) {
    return <>
    <p>loading....</p>
    </>;
  }

  const onSubmit = (value: ILeedBody) => {
    if (id) {
      updateLeed({ id: id, data: value });
    }
    return Promise.resolve();
  };

  return (
    <div className="flex justify-start">
      <div className=" bg-white p-8 w-full max-w-4xl">
        <LeedForm
          type="UPDATE"
          initialValues={{
            fio: data.fio,
            phone: data.phone,
            discoveryMethod: data.discoveryMethod,
            comment: data.comment,
            startTime: data.startTime,
            endTime: data.endTime,
            classDays: data.classDays,
            courseId: `${data.courseId}`,
          }}
          submitForm={onSubmit}
          isLoading={isLoading}
          id={id}
        />
      </div>
    </div>
  );
};
