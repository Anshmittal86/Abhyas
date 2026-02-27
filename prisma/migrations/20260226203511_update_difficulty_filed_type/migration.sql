/*
  Warnings:

  - The `difficulty` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "QuestionDifficulty";
