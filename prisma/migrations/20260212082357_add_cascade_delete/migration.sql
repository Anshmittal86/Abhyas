-- DropForeignKey
ALTER TABLE "AttemptAnswer" DROP CONSTRAINT "AttemptAnswer_questionId_fkey";

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
