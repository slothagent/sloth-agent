-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ticker" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "curveAddress" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "systemType" TEXT,
    "imageUrl" TEXT,
    "agentLore" TEXT,
    "personality" TEXT,
    "communicationStyle" TEXT,
    "knowledgeAreas" TEXT,
    "tools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "examples" TEXT,
    "twitterUsername" TEXT,
    "twitterEmail" TEXT,
    "twitterPassword" TEXT,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMetrics" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "liquidityAmount" DOUBLE PRECISION NOT NULL,
    "liquidityValue" DOUBLE PRECISION NOT NULL,
    "blueChipHolding" DOUBLE PRECISION NOT NULL,
    "holdersCount" INTEGER NOT NULL,
    "holdersChange24h" INTEGER NOT NULL,
    "smartMoneyValue" DOUBLE PRECISION NOT NULL,
    "smartMoneyKol" INTEGER NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "buyTransactions" INTEGER NOT NULL,
    "sellTransactions" INTEGER NOT NULL,
    "volumeLastHour" DOUBLE PRECISION NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "priceChange1m" DOUBLE PRECISION NOT NULL,
    "marketCap" DOUBLE PRECISION NOT NULL,
    "followersCount" INTEGER NOT NULL,
    "topTweetsCount" INTEGER NOT NULL,

    CONSTRAINT "AgentMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentMetrics_agentId_idx" ON "AgentMetrics"("agentId");

-- AddForeignKey
ALTER TABLE "AgentMetrics" ADD CONSTRAINT "AgentMetrics_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
