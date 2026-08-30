import {eq} from 'drizzle-orm';
import {db} from '../db/index.js';
import {customersTable, jobsTable} from '../db/schema.js';
import {eventBus} from '../lib/eventBus.js';

export async function createJob(values: typeof jobsTable.$inferInsert) {
  const [job] = await db.insert(jobsTable).values(values).returning();
  if (job == null) return null;
  eventBus.publish('job.created', job);
  return job;
}

export async function getQuotations() {
  return db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      quoteAmount: jobsTable.quoteAmount,
      stage: jobsTable.stage,
      location: jobsTable.location,
      customer: {
        id: customersTable.id,
        name: customersTable.name,
      },
    })
    .from(jobsTable)
    .innerJoin(customersTable, eq(jobsTable.customerId, customersTable.id))
    .where(eq(jobsTable.stage, 'QUOTATION'));
}

export async function updateJob(
  id: string,
  values: Partial<typeof jobsTable.$inferInsert>,
) {
  const [job] = await db
    .update(jobsTable)
    .set(values)
    .where(eq(jobsTable.id, id))
    .returning();
  if (job == null) return null;
  return job;
}
