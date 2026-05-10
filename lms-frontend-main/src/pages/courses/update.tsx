import {
  CourseBody,
  useGetCourseQuery,
  useUpdateCourseMutation,
} from "@/app/store/services/course.service";
import { CourseForm } from "@/features/course-form";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const UpdateCoursePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch } = useGetCourseQuery(id as string);
  const [updateCourse] = useUpdateCourseMutation();

  if (!isLoading && !data) {
    navigate(-1);
    return null;
  }

  useEffect(() => {
    refetch();
  }, []);

  const submitForm = (values: CourseBody) =>
    updateCourse({ ...values, id: data.id });

  return (
    <CourseForm type={"update"} initialValues={data} submitForm={submitForm} isLoading={isLoading}/>
  );
};
