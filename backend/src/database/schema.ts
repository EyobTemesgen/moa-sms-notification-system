import { pgTable, uuid, varchar, text, numeric, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('FINANCE_OFFICER'), // 'ADMIN' | 'FINANCE_OFFICER'
  phone: varchar('phone', { length: 30 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  voucherRef: varchar('voucher_ref', { length: 100 }).notNull().unique(),
  payeeName: varchar('payee_name', { length: 200 }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull().default('Bank Transfer'),
  paymentDate: varchar('payment_date', { length: 50 }).notNull(),
  notes: text('notes'),
  createdById: uuid('created_by_id').references(() => users.id),
  requiresAlert: boolean('requires_alert').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alertRecipients = pgTable('alert_recipients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 30 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const smsAlerts = pgTable('sms_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'cascade' }),
  recipientId: uuid('recipient_id').references(() => alertRecipients.id, { onDelete: 'set null' }),
  recipientNumber: varchar('recipient_number', { length: 30 }).notNull(),
  recipientName: varchar('recipient_name', { length: 150 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // 'SENT' | 'FAILED' | 'PENDING'
  gatewayResponse: text('gateway_response'),
  sentAt: timestamp('sent_at'),
  retryCount: integer('retry_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemSettings = pgTable('system_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  thresholdAmount: numeric('threshold_amount', { precision: 15, scale: 2 }).notNull().default('20000000.00'),
  isAlertEnabled: boolean('is_alert_enabled').notNull().default(true),
  smsProvider: varchar('sms_provider', { length: 50 }).notNull().default('mock'), // 'mock' | 'http'
  smsGatewayUrl: text('sms_gateway_url'),
  smsGatewayKey: text('sms_gateway_key'),
  smsSenderId: varchar('sms_sender_id', { length: 50 }).notNull().default('MOA-FINANCE'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [payments.createdById],
    references: [users.id],
  }),
  alerts: many(smsAlerts),
}));

export const smsAlertsRelations = relations(smsAlerts, ({ one }) => ({
  payment: one(payments, {
    fields: [smsAlerts.paymentId],
    references: [payments.id],
  }),
  recipient: one(alertRecipients, {
    fields: [smsAlerts.recipientId],
    references: [alertRecipients.id],
  }),
}));

