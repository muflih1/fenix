import {db} from '../db/index.js';
import {customersTable} from '../db/schema.js';

export async function createCustomer(
  values: typeof customersTable.$inferInsert,
) {
  const [customer] = await db
    .insert(customersTable)
    .values([values])
    .returning();
  if (customer == null) return null;
  return customer;
}
