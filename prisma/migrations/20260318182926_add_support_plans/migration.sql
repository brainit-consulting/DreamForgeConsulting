-- CreateTable
CREATE TABLE "support_plans" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "planType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "monthlyRate" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "includedHours" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "overageRate" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hoursUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthsInvoiced" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_plans_projectId_key" ON "support_plans"("projectId");

-- AddForeignKey
ALTER TABLE "support_plans" ADD CONSTRAINT "support_plans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
