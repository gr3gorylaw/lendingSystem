import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Roles table
export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // 'admin', 'borrower'
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  roleId: integer("role_id").notNull().references(() => roles.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Loan Products table
export const loanProducts = sqliteTable("loan_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  minAmount: real("min_amount").notNull(),
  maxAmount: real("max_amount").notNull(),
  interestRate: real("interest_rate").notNull(), // Annual interest rate
  minTenure: integer("min_tenure").notNull(), // In months
  maxTenure: integer("max_tenure").notNull(), // In months
  processingFee: real("processing_fee").default(0), // Percentage or fixed
  lateFeePercentage: real("late_fee_percentage").default(2), // Per month
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Loan Applications table
export const loanApplications = sqliteTable("loan_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationNumber: text("application_number").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => loanProducts.id),
  requestedAmount: real("requested_amount").notNull(),
  requestedTenure: integer("requested_tenure").notNull(), // In months
  purpose: text("purpose"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  remarks: text("remarks"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Loans table (approved and disbursed)
export const loans = sqliteTable("loans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  loanNumber: text("loan_number").notNull().unique(),
  applicationId: integer("application_id").notNull().references(() => loanApplications.id),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => loanProducts.id),
  principalAmount: real("principal_amount").notNull(),
  interestRate: real("interest_rate").notNull(),
  tenure: integer("tenure").notNull(), // In months
  emiAmount: real("emi_amount").notNull(),
  totalPayable: real("total_payable").notNull(),
  outstandingBalance: real("outstanding_balance").notNull(),
  disbursedAmount: real("disbursed_amount"),
  disbursedDate: integer("disbursed_date", { mode: "timestamp" }),
  status: text("status").notNull().default("active"), // active, closed, defaulted
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Repayment Schedules table
export const repaymentSchedules = sqliteTable("repayment_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  loanId: integer("loan_id").notNull().references(() => loans.id),
  installmentNumber: integer("installment_number").notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  emiAmount: real("emi_amount").notNull(),
  principalAmount: real("principal_amount").notNull(),
  interestAmount: real("interest_amount").notNull(),
  paidAmount: real("paid_amount").default(0),
  lateFee: real("late_fee").default(0),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  paidDate: integer("paid_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Payments table
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  paymentNumber: text("payment_number").notNull().unique(),
  loanId: integer("loan_id").notNull().references(() => loans.id),
  scheduleId: integer("schedule_id").references(() => repaymentSchedules.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method"), // cash, bank_transfer, razorpay, stripe
  transactionId: text("transaction_id"),
  paymentType: text("payment_type").notNull(), // emi, partial, advance
  remarks: text("remarks"),
  recordedBy: integer("recorded_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Documents table
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id").references(() => loanApplications.id),
  loanId: integer("loan_id").references(() => loans.id),
  userId: integer("user_id").notNull().references(() => users.id),
  documentType: text("document_type").notNull(), // id_proof, address_proof, income_proof, etc.
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Settings table
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Sessions table (for auth)
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Type exports
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type LoanProduct = typeof loanProducts.$inferSelect;
export type NewLoanProduct = typeof loanProducts.$inferInsert;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type NewLoanApplication = typeof loanApplications.$inferInsert;
export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
export type RepaymentSchedule = typeof repaymentSchedules.$inferSelect;
export type NewRepaymentSchedule = typeof repaymentSchedules.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
