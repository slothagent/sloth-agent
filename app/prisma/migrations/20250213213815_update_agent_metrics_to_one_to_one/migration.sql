/*
  Warnings:

  - A unique constraint covering the columns `[agentId]` on the table `AgentMetrics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `AgentMetrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgentMetrics" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AgentMetrics_agentId_key" ON "AgentMetrics"("agentId");
