import {eq, not} from 'drizzle-orm';
import {db} from '../db/index.js';
import {usersTable} from '../db/schema.js';
import omit from 'lodash.omit';

export async function getUser(id: string, omitPassword = true) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  if (user == null) return null;
  if (!omitPassword) return user;
  return omit(user, ['passwordDigest']);
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  if (user == null) return null;
  return user;
}

export function getEmployees() {
  return db
    .select({id: usersTable.id, name: usersTable.name, role: usersTable.role})
    .from(usersTable)
    .where(not(eq(usersTable.role, 'MANAGER')));
}
