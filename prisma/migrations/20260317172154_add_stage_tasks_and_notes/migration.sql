-- CreateTable
CREATE TABLE "stage_tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stage" "ProjectStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stage_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_notes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stage" "ProjectStatus" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stage_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stage_tasks_projectId_stage_idx" ON "stage_tasks"("projectId", "stage");

-- CreateIndex
CREATE INDEX "stage_notes_projectId_stage_idx" ON "stage_notes"("projectId", "stage");

-- AddForeignKey
ALTER TABLE "stage_tasks" ADD CONSTRAINT "stage_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_notes" ADD CONSTRAINT "stage_notes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
