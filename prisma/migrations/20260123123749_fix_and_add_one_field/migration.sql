/*
  Warnings:

  - Added the required column `expiresAt` to the `TestAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'SUBMITTED');

-- DropIndex
DROP INDEX "TestAttempt_studentId_testId_startedAt_key";

-- AlterTable
ALTER TABLE "TestAttempt" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "TestStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- CreateIndex
CREATE INDEX "TestAttempt_studentId_testId_idx" ON "TestAttempt"("studentId", "testId");
