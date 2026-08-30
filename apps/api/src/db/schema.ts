import {
  customType,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const bytea = customType<{data: Buffer<ArrayBuffer>}>({
  dataType() {
    return 'bytea';
  },
});

export const userRolesEnum = pgEnum('user_role', [
  'MANAGER',
  'SUPERVISOR',
  'FRONT_OFFICE',
  'DESIGNER',
  'TECHNISION',
]);

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordDigest: text('password_digest').notNull(),
  role: userRolesEnum().notNull(),
  picture: text(),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  modifiedAt: timestamp('modified_at', {withTimezone: true})
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const sessionsTable = pgTable('sessions', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, {onDelete: 'cascade'}),
  secretDigest: bytea('secret_digest').notNull(),
  lastVerifiedAt: timestamp('last_verified_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
});

export const customersTable = pgTable('customers', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  phone: text().notNull(),
  email: text(),
  picture: text(),
  companyName: text('company_name'),
  address: text(),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  modifiedAt: timestamp('modified_at', {withTimezone: true})
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const jobsTable = pgTable('jobs', {
  id: uuid().primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customersTable.id),
  title: text().notNull(),
  stage: text({
    enum: [
      'QUOTATION',
      'APPROVED',
      'REJECTED',
      'DESIGNING',
      'MANUFACTURING',
      'REVIEWING',
      'INSTALLING',
      'COMPLETED',
    ],
  }).default('QUOTATION'),
  rejectedReason: text('rejected_reason'),
  quoteAmount: text('quote_amount').notNull(),
  location: text().notNull(),
  priority: text().default('NORMAL'),
  createdAt: timestamp('created_at', {withTimezone: true})
    .notNull()
    .defaultNow(),
  modifiedAt: timestamp('modified_at', {withTimezone: true})
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
