import { pgTable, text, real, timestamp, boolean } from 'drizzle-orm/pg-core';

// ----------------------------------------------------
// BETTER AUTH USER & SESSION SCHEMA WITH ROLES
// ----------------------------------------------------

export const userRoleEnum = [
  'MANAGER',
  'SUPERVISOR',
  'FRONT_OFFICE',
  'DESIGNER',
  'TECHNICIAN'
] as const;

export type UserRole = typeof userRoleEnum[number];

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role').notNull().default('MANAGER'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ----------------------------------------------------
// ERP CORE TABLES (CLEAN RELATIONAL SCHEMA WITH JOINS)
// ----------------------------------------------------

// 1. Normalized Companies Table
export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  taxId: text('tax_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Customers Table (References Company via Foreign Key)
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  companyId: text('company_id').references(() => companies.id),
  phone: text('phone').notNull(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Jobs Table (Pure Relational Order Table with Refactored Workflow)
export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  companyId: text('company_id').references(() => companies.id),
  customerId: text('customer_id').references(() => customers.id),
  signType: text('sign_type').notNull(),
  width: real('width').notNull(),
  height: real('height').notNull(),
  unit: text('unit').notNull(),
  installationType: text('installation_type').notNull(),
  siteAddress: text('site_address').notNull(),
  stage: text('stage').notNull().default('QUOTATION'),
  productionSubStatus: text('production_sub_status'),
  priority: text('priority').notNull().default('NORMAL'),
  notes: text('notes'),
  assignedDesignerName: text('assigned_designer_name'),
  assignedTeam: text('assigned_team'),
  installationDate: text('installation_date'),
  
  // Site Survey Inspection & Visit Fields
  surveyScheduledDate: text('survey_scheduled_date'),
  surveyorName: text('surveyor_name'),
  surveyStatus: text('survey_status').notNull().default('NOT_SCHEDULED'),
  wallType: text('wall_type'),
  accessMethod: text('access_method'),
  wallThicknessInches: real('wall_thickness_inches'),
  electricalHookupAvailable: boolean('electrical_hookup_available').default(true),
  powerDistanceFt: real('power_distance_ft'),
  sitePhotosJson: text('site_photos_json'),
  surveyNotes: text('survey_notes'),

  // Financial breakdown
  estimatedMaterialCost: real('estimated_material_cost').notNull().default(0),
  laborCost: real('labor_cost').notNull().default(0),
  overheadCost: real('overhead_cost').notNull().default(0),
  markupPercent: real('markup_percent').notNull().default(30),
  totalQuoteAmount: real('total_quote_amount').notNull().default(0),
  depositPaid: real('deposit_paid').notNull().default(0),
  finalBalancePaid: real('final_balance_paid').notNull().default(0),
  paymentStatus: text('payment_status').notNull().default('PENDING_DEPOSIT'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Inventory Items Table
export const inventoryItems = pgTable('inventory_items', {
  id: text('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  stockQuantity: real('stock_quantity').notNull().default(0),
  minReorderLevel: real('min_reorder_level').notNull().default(10),
  unit: text('unit').notNull().default('pcs'),
  unitCostPrice: real('unit_cost_price').notNull().default(0),
  sellingPrice: real('selling_price'),
  supplier: text('supplier').notNull().default('General Supplier'),
  binLocation: text('bin_location').notNull().default('Unassigned'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Job BOM Items (Junction table linking Jobs & Inventory Materials)
export const jobBomItems = pgTable('job_bom_items', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  inventoryItemId: text('inventory_item_id').notNull().references(() => inventoryItems.id),
  quantity: real('quantity').notNull(),
  unitCost: real('unit_cost').notNull(),
  totalCost: real('total_cost').notNull(),
});

// 6. Stock Movement Logs Table
export const stockLogs = pgTable('stock_movement_logs', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull().references(() => inventoryItems.id),
  itemName: text('item_name').notNull(),
  type: text('type').notNull(),
  quantityChanged: real('quantity_changed').notNull(),
  jobId: text('job_id').references(() => jobs.id),
  notes: text('notes').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
