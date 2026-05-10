-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('new', 'passed', 'cancelled');

-- CreateEnum
CREATE TYPE "MentorStatus" AS ENUM ('active', 'noActive');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('in', 'out');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('salary', 'rent', 'communal', 'other');

-- CreateEnum
CREATE TYPE "ProfitType" AS ENUM ('payment', 'other');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('cash', 'click', 'card', 'transfer');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('waiting', 'waitingConfirm', 'completed', 'cancelled', 'notPassed');

-- CreateEnum
CREATE TYPE "LessonStudentReason" AS ENUM ('gotSick', 'askedOff', 'unknown');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('active', 'noActive', 'vacation');

-- CreateEnum
CREATE TYPE "LeedStatus" AS ENUM ('new', 'refused', 'waitingGroup', 'inGroup', 'finished');

-- CreateEnum
CREATE TYPE "DiscoveryMethod" AS ENUM ('streetAd', 'fromFriends', 'radio', 'tv', 'telegram', 'instagram');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('waiting', 'active', 'frozen', 'completed');

-- CreateEnum
CREATE TYPE "GroupStudentStatus" AS ENUM ('active', 'stopped', 'completed');

-- CreateEnum
CREATE TYPE "ClassDays" AS ENUM ('even', 'odd', 'every', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur', 'Sun');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CEO', 'admin', 'manager', 'mentor', 'assistent');

-- CreateEnum
CREATE TYPE "MentorSalaryType" AS ENUM ('fixed', 'fixedLesson', 'percentLesson');

-- CreateEnum
CREATE TYPE "UserStatusType" AS ENUM ('work', 'noWork', 'onSickLeave', 'onVacation');

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leed" (
    "id" SERIAL NOT NULL,
    "fio" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "discoveryMethod" "DiscoveryMethod" NOT NULL,
    "status" "LeedStatus" NOT NULL DEFAULT 'new',
    "comment" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "classDays" "ClassDays"[] DEFAULT ARRAY['every']::"ClassDays"[],
    "courseId" INTEGER,
    "authorId" INTEGER,
    "date" TIMESTAMP(3),

    CONSTRAINT "Leed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "fio" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneSecond" TEXT,
    "documentSeries" TEXT,
    "status" "UserStatusType" DEFAULT 'work',
    "documentNo" TEXT,
    "salaryMentorType" "MentorSalaryType",
    "salaryMentor" INTEGER,
    "salary" INTEGER DEFAULT 0,
    "telegram" TEXT,
    "sex" TEXT,
    "birthday" TEXT,
    "socialStatus" TEXT,
    "education" TEXT,
    "familyStatus" TEXT,
    "address" TEXT,
    "cardNo" TEXT,
    "cardPlaceholder" TEXT,
    "lang" TEXT DEFAULT 'ru',
    "branch" INTEGER DEFAULT 1,
    "balance" DOUBLE PRECISION DEFAULT 0,
    "availableBalance" DOUBLE PRECISION DEFAULT 0,
    "acceptedBalance" DOUBLE PRECISION DEFAULT 0,
    "role" "Role"[],
    "avatar" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBranch" (
    "userId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,

    CONSTRAINT "UserBranch_pkey" PRIMARY KEY ("userId","branchId")
);

-- CreateTable
CREATE TABLE "mentors" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "MentorStatus" DEFAULT 'active',

    CONSTRAINT "mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "fio" TEXT NOT NULL,
    "balance" DOUBLE PRECISION DEFAULT 0,
    "phone" TEXT NOT NULL,
    "sex" TEXT,
    "telegram" TEXT,
    "documentSeries" TEXT,
    "documentNo" TEXT,
    "birthday" TEXT NOT NULL,
    "pinfl" TEXT,
    "status" "StudentStatus" DEFAULT 'active',
    "fatherFio" TEXT,
    "fatherPhone" TEXT,
    "fatherJob" TEXT,
    "montherFio" TEXT,
    "montherPhone" TEXT,
    "montherJob" TEXT,
    "disability" BOOLEAN DEFAULT false,
    "avatar" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "GroupStatus" NOT NULL DEFAULT 'waiting',
    "courseId" INTEGER NOT NULL,
    "classDays" "ClassDays"[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "mentorId" INTEGER,
    "responsibleId" INTEGER,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_students" (
    "groupId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION DEFAULT 0,
    "discountComment" TEXT,
    "status" "GroupStudentStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "group_students_pkey" PRIMARY KEY ("groupId","studentId")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "LessonStatus" DEFAULT 'waiting',
    "comment" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "groupId" INTEGER,
    "mentorId" INTEGER,
    "responsibleId" INTEGER,
    "branchId" INTEGER,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_on_lesson" (
    "studentId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "attended" BOOLEAN NOT NULL,
    "discount" INTEGER,
    "reason" "LessonStudentReason",

    CONSTRAINT "student_on_lesson_pkey" PRIMARY KEY ("studentId","lessonId")
);

-- CreateTable
CREATE TABLE "student_bonuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "userId" INTEGER,
    "mentorPercent" INTEGER,

    CONSTRAINT "student_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "type" "TransactionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "authorId" INTEGER,
    "comment" TEXT,
    "paymentType" "PaymentType",
    "studentId" INTEGER,
    "userId" INTEGER,
    "expenseType" "ExpenseType",
    "profitType" "ProfitType",
    "branchId" INTEGER NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fines" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,

    CONSTRAINT "fines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,

    CONSTRAINT "bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'new',
    "responsibleId" INTEGER NOT NULL,
    "comments" TEXT,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_grades" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "grade" DOUBLE PRECISION,
    "comment" TEXT,

    CONSTRAINT "exam_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseToStudent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CourseToMentor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "mentors_userId_key" ON "mentors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_grades_examId_studentId_key" ON "exam_grades"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToStudent_AB_unique" ON "_CourseToStudent"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToStudent_B_index" ON "_CourseToStudent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToMentor_AB_unique" ON "_CourseToMentor"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToMentor_B_index" ON "_CourseToMentor"("B");

-- AddForeignKey
ALTER TABLE "Leed" ADD CONSTRAINT "Leed_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leed" ADD CONSTRAINT "Leed_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBranch" ADD CONSTRAINT "UserBranch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBranch" ADD CONSTRAINT "UserBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "mentors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_students" ADD CONSTRAINT "group_students_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_students" ADD CONSTRAINT "group_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "mentors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_on_lesson" ADD CONSTRAINT "student_on_lesson_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_on_lesson" ADD CONSTRAINT "student_on_lesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_bonuses" ADD CONSTRAINT "student_bonuses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_bonuses" ADD CONSTRAINT "student_bonuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonuses" ADD CONSTRAINT "bonuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonuses" ADD CONSTRAINT "bonuses_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonuses" ADD CONSTRAINT "bonuses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_grades" ADD CONSTRAINT "exam_grades_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_grades" ADD CONSTRAINT "exam_grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToStudent" ADD CONSTRAINT "_CourseToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToStudent" ADD CONSTRAINT "_CourseToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToMentor" ADD CONSTRAINT "_CourseToMentor_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToMentor" ADD CONSTRAINT "_CourseToMentor_B_fkey" FOREIGN KEY ("B") REFERENCES "mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
