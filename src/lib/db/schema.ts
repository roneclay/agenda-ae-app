import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

export const planEnum = pgEnum('plan', ['free', 'pro'])
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trial',
  'active',
  'cancelled',
  'past_due',
])
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'scheduled',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
])
export const reminderTypeEnum = pgEnum('reminder_type', [
  'confirmation',
  'reminder_24h',
  'reminder_6h',
  'reminder_2h',
  'followup',
  'trial_expiring',
  'trial_expired',
])
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'tool'])
export const nicheEnum = pgEnum('niche', ['beauty', 'legal', 'petcare', 'fitness'])
export const dayKeyEnum = pgEnum('day_key', [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
])

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const professional = pgTable('professional', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  niche: nicheEnum('niche').notNull().default('beauty'),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  phone: text('phone'),
  bio: text('bio'),
  photoUrl: text('photo_url'),
  address: text('address'),
  isAcceptingBookings: boolean('is_accepting_bookings').notNull().default(false),
  whatsappPhoneNumberId: text('whatsapp_phone_number_id'),
  whatsappBusinessAccountId: text('whatsapp_business_account_id'),
  whatsappAccessToken: text('whatsapp_access_token'),
  plan: planEnum('plan').notNull().default('free'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').notNull().default('trial'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  abacatepayCustomerId: text('abacatepay_customer_id'),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const service = pgTable('service', {
  id: uuid('id').primaryKey().defaultRandom(),
  professionalId: uuid('professional_id')
    .notNull()
    .references(() => professional.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const customer = pgTable(
  'customer',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professional.id, { onDelete: 'cascade' }),
    whatsappId: text('whatsapp_id').notNull(),
    email: text('email'),
    name: text('name'),
    lastVisitAt: timestamp('last_visit_at', { withTimezone: true }),
  },
  (t) => ({ uniq: unique().on(t.professionalId, t.whatsappId) }),
)

export const appointment = pgTable(
  'appointment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professional.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customer.id),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    totalCents: integer('total_cents').notNull(),
    status: appointmentStatusEnum('status').notNull().default('scheduled'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({ noOverlap: unique().on(t.professionalId, t.scheduledAt) }),
)

export const appointmentService = pgTable('appointment_service', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .references(() => appointment.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id')
    .notNull()
    .references(() => service.id),
  priceCents: integer('price_cents').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
})

export const availabilityBlock = pgTable('availability_block', {
  id: uuid('id').primaryKey().defaultRandom(),
  professionalId: uuid('professional_id')
    .notNull()
    .references(() => professional.id, { onDelete: 'cascade' }),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  reason: text('reason'),
})

export const weeklyScheduleWindow = pgTable('weekly_schedule_window', {
  id: uuid('id').primaryKey().defaultRandom(),
  professionalId: uuid('professional_id')
    .notNull()
    .references(() => professional.id, { onDelete: 'cascade' }),
  dayKey: dayKeyEnum('day_key').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
})

export const dateOverride = pgTable(
  'date_override',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professional.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    isOpen: boolean('is_open').notNull(),
  },
  (t) => ({ uniq: unique().on(t.professionalId, t.date) }),
)

export const dateOverrideWindow = pgTable('date_override_window', {
  id: uuid('id').primaryKey().defaultRandom(),
  dateOverrideId: uuid('date_override_id')
    .notNull()
    .references(() => dateOverride.id, { onDelete: 'cascade' }),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
})

export const conversation = pgTable(
  'conversation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professional.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customer.id),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  },
  (t) => ({ uniq: unique().on(t.professionalId, t.customerId) }),
)

export const message = pgTable('message', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: text('content'),
  toolCalls: text('tool_calls'),
  toolResults: text('tool_results'),
  tokensUsed: integer('tokens_used').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const notificationLog = pgTable('notification_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  professionalId: uuid('professional_id')
    .notNull()
    .references(() => professional.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customer.id),
  appointmentId: uuid('appointment_id').references(() => appointment.id),
  type: reminderTypeEnum('type').notNull(),
  channel: text('channel').notNull().default('whatsapp'),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
  status: text('status').notNull().default('sent'),
})

export const emailLog = pgTable('email_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  professionalId: uuid('professional_id').references(() => professional.id),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  template: text('template').notNull(),
  resendId: text('resend_id'),
  status: text('status').notNull().default('sent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
