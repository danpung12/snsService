-- CreateTable
CREATE TABLE "PostDailyStat" (
    "id" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "snapshotViewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostDailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostDailyStat_postId_date_key" ON "PostDailyStat"("postId", "date");

-- AddForeignKey
ALTER TABLE "PostDailyStat" ADD CONSTRAINT "PostDailyStat_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
