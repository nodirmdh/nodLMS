-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'inProgress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentPlanStatus" AS ENUM ('active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentPlanItemStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "HomeworkSubmissionStatus" AS ENUM ('submitted', 'reviewed', 'returned');

-- AlterTable
ALTER TABLE "Leed" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refusedReason" TEXT;

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3),
    "assignedTo" INTEGER,
    "relatedEntity" TEXT,
    "relatedId" INTEGER,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "monthsCount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "PaymentPlanStatus" NOT NULL DEFAULT 'active',
    "comment" TEXT,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plan_items" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PaymentPlanItemStatus" NOT NULL DEFAULT 'pending',
    "paidTransactionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homeworks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "groupId" INTEGER,
    "lessonId" INTEGER,
    "dueDate" TIMESTAMP(3),
    "attachments" JSONB,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homeworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_submissions" (
    "id" SERIAL NOT NULL,
    "homeworkId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "comment" TEXT,
    "files" JSONB,
    "grade" DOUBLE PRECISION,
    "reviewerComment" TEXT,
    "status" "HomeworkSubmissionStatus" NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" INTEGER,

    CONSTRAINT "homework_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_links" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "studentId" INTEGER,
    "telegramUserId" TEXT NOT NULL,
    "username" TEXT,
    "linkCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "telegram_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_assignedTo_status_idx" ON "tasks"("assignedTo", "status");

-- CreateIndex
CREATE INDEX "tasks_dueAt_status_idx" ON "tasks"("dueAt", "status");

-- CreateIndex
CREATE INDEX "tasks_relatedEntity_relatedId_idx" ON "tasks"("relatedEntity", "relatedId");

-- CreateIndex
CREATE INDEX "payment_plans_studentId_status_idx" ON "payment_plans"("studentId", "status");

-- CreateIndex
CREATE INDEX "payment_plan_items_planId_dueDate_idx" ON "payment_plan_items"("planId", "dueDate");

-- CreateIndex
CREATE INDEX "payment_plan_items_status_dueDate_idx" ON "payment_plan_items"("status", "dueDate");

-- CreateIndex
CREATE INDEX "homeworks_groupId_dueDate_idx" ON "homeworks"("groupId", "dueDate");

-- CreateIndex
CREATE INDEX "homeworks_lessonId_idx" ON "homeworks"("lessonId");

-- CreateIndex
CREATE INDEX "homework_submissions_studentId_idx" ON "homework_submissions"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "homework_submissions_homeworkId_studentId_key" ON "homework_submissions"("homeworkId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_links_telegramUserId_key" ON "telegram_links"("telegramUserId");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_links_linkCode_key" ON "telegram_links"("linkCode");

-- CreateIndex
CREATE INDEX "telegram_links_userId_idx" ON "telegram_links"("userId");

-- CreateIndex
CREATE INDEX "telegram_links_studentId_idx" ON "telegram_links"("studentId");

-- CreateIndex
CREATE INDEX "Leed_status_position_idx" ON "Leed"("status", "position");

-- AddForeignKey
ALTER TABLE "payment_plan_items" ADD CONSTRAINT "payment_plan_items_planId_fkey" FOREIGN KEY ("planId") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "homeworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
