/*
  Warnings:

  - You are about to drop the column `selectedOption` on the `AttemptAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `correctOption` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `optionA` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `optionB` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `optionC` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `optionD` on the `Question` table. All the data in the column will be lost.
  - Added the required column `questionType` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'CODE');

-- AlterTable
ALTER TABLE "AttemptAnswer" DROP COLUMN "selectedOption",
ADD COLUMN     "codeAnswer" TEXT,
ADD COLUMN     "marksAwarded" INTEGER,
ADD COLUMN     "selectedOptionId" TEXT,
ADD COLUMN     "textAnswer" TEXT;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctOption",
DROP COLUMN "optionA",
DROP COLUMN "optionB",
DROP COLUMN "optionC",
DROP COLUMN "optionD",
ADD COLUMN     "difficulty" INTEGER,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "marks" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "questionType" "QuestionType" NOT NULL;

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- CreateIndex
CREATE INDEX "AttemptAnswer_selectedOptionId_idx" ON "AttemptAnswer"("selectedOptionId");

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "QuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
