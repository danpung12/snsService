-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'MESSAGE';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "chatRoomId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_chatRoomId_idx" ON "Notification"("chatRoomId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
