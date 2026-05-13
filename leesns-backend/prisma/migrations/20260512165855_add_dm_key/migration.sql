/*
  Warnings:

  - A unique constraint covering the columns `[dmKey]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dmKey` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "dmKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_dmKey_key" ON "ChatRoom"("dmKey");
