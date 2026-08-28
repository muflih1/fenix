import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {db} from './index.js';
import {usersTable} from './schema.js';

async function seedManager() {
  const salt = await bcrypt.genSalt(12);
  const digest = await bcrypt.hash(
    process.env.MANAGER_PASSWORD as string,
    salt,
  );
  await db
    .insert(usersTable)
    .values({
      name: 'Manager',
      email: process.env.MANAGER_EMAIL as string,
      passwordDigest: digest,
      role: 'MANAGER',
    })
    .onConflictDoNothing({target: usersTable.email});
}

async function bootstrap() {
  await seedManager();
}

bootstrap()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
