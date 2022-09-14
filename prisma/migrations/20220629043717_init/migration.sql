/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `theme` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expandCode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showGutter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "theme" VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE "Profile";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
