-- CreateTable
CREATE TABLE "SavedDeal" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campusId" TEXT,

    CONSTRAINT "SavedDeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedDeal_userId_idx" ON "SavedDeal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedDeal_dealId_userId_key" ON "SavedDeal"("dealId", "userId");

-- AddForeignKey
ALTER TABLE "SavedDeal" ADD CONSTRAINT "SavedDeal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDeal" ADD CONSTRAINT "SavedDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedDeal" ADD CONSTRAINT "SavedDeal_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
