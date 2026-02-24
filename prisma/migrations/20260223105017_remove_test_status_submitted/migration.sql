/*
  Warnings:

  - The `status` column on the `TestAttempt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TestAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "TestAttempt" DROP COLUMN "status",
ADD COLUMN     "status" "TestAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- DropEnum
DROP TYPE "TestStatus";
