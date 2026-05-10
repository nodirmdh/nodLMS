// import { useCreateCourseMutation } from "@/app/store/services/course.service";
import { useCreateCourseMutation } from "@/app/store/services/course.service";
import { RootState } from "@/app/store/store.config";
import { CourseForm } from "@/features/course-form";
import { useSelector } from "react-redux";
export const CreateCoursePage = () => {
  const [createCourse,{isLoading}] = useCreateCourseMutation();
  const branch=useSelector((state:RootState)=>state.userState.branch)
  return (
    <CourseForm
      type={"create"}
      initialValues={{
        name: "",
        branchId: branch?branch.toString():"1",
        price:""
      }}
      submitForm={createCourse}
      isLoading={isLoading}
    />
  );
};
