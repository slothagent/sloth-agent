/*
  Warnings:

  - You are about to drop the column `twitterEmail` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `twitterPassword` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUsername` on the `Agent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "twitterEmail",
DROP COLUMN "twitterPassword",
DROP COLUMN "twitterUsername";

-- CreateTable
CREATE TABLE "TwitterAuth" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwitterAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAuth_agentId_key" ON "TwitterAuth"("agentId");

-- CreateIndex
CREATE INDEX "TwitterAuth_agentId_idx" ON "TwitterAuth"("agentId");

-- AddForeignKey
ALTER TABLE "TwitterAuth" ADD CONSTRAINT "TwitterAuth_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
