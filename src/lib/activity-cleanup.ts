import { db } from "./db";

const MAX_PER_ENTITY = 500;

/**
 * Prune activities to keep only the most recent MAX_PER_ENTITY per (entityType, entityId).
 * Called by the daily cron job.
 */
export async function pruneActivities(): Promise<number> {
  let totalDeleted = 0;

  // Find entity groups that exceed the limit
  const groups: Array<{ entityType: string; entityId: string; cnt: bigint }> =
    await db.$queryRawUnsafe(`
      SELECT "entityType", "entityId", COUNT(*) as cnt
      FROM activities
      GROUP BY "entityType", "entityId"
      HAVING COUNT(*) > ${MAX_PER_ENTITY}
    `);

  for (const group of groups) {
    // Find the cutoff date (the createdAt of the 500th newest activity)
    const cutoff = await db.activity.findFirst({
      where: { entityType: group.entityType, entityId: group.entityId },
      orderBy: { createdAt: "desc" },
      skip: MAX_PER_ENTITY - 1,
      select: { createdAt: true },
    });

    if (!cutoff) continue;

    const result = await db.activity.deleteMany({
      where: {
        entityType: group.entityType,
        entityId: group.entityId,
        createdAt: { lt: cutoff.createdAt },
      },
    });

    totalDeleted += result.count;
  }

  if (totalDeleted > 0) {
    console.log(`[Activity Cleanup] Pruned ${totalDeleted} old activities`);
  }

  return totalDeleted;
}
