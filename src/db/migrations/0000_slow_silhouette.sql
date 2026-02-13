CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer,
	`loan_id` integer,
	`user_id` integer NOT NULL,
	`document_type` text NOT NULL,
	`file_name` text NOT NULL,
	`file_path` text NOT NULL,
	`uploaded_at` integer,
	FOREIGN KEY (`application_id`) REFERENCES `loan_applications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `loan_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_number` text NOT NULL,
	`user_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`requested_amount` real NOT NULL,
	`requested_tenure` integer NOT NULL,
	`purpose` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`remarks` text,
	`reviewed_by` integer,
	`reviewed_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `loan_products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `loan_applications_application_number_unique` ON `loan_applications` (`application_number`);--> statement-breakpoint
CREATE TABLE `loan_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`min_amount` real NOT NULL,
	`max_amount` real NOT NULL,
	`interest_rate` real NOT NULL,
	`min_tenure` integer NOT NULL,
	`max_tenure` integer NOT NULL,
	`processing_fee` real DEFAULT 0,
	`late_fee_percentage` real DEFAULT 2,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`loan_number` text NOT NULL,
	`application_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`principal_amount` real NOT NULL,
	`interest_rate` real NOT NULL,
	`tenure` integer NOT NULL,
	`emi_amount` real NOT NULL,
	`total_payable` real NOT NULL,
	`outstanding_balance` real NOT NULL,
	`disbursed_amount` real,
	`disbursed_date` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`application_id`) REFERENCES `loan_applications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `loan_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `loans_loan_number_unique` ON `loans` (`loan_number`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payment_number` text NOT NULL,
	`loan_id` integer NOT NULL,
	`schedule_id` integer,
	`user_id` integer NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text,
	`transaction_id` text,
	`payment_type` text NOT NULL,
	`remarks` text,
	`recorded_by` integer,
	`created_at` integer,
	FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`schedule_id`) REFERENCES `repayment_schedules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_payment_number_unique` ON `payments` (`payment_number`);--> statement-breakpoint
CREATE TABLE `repayment_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`loan_id` integer NOT NULL,
	`installment_number` integer NOT NULL,
	`due_date` integer NOT NULL,
	`emi_amount` real NOT NULL,
	`principal_amount` real NOT NULL,
	`interest_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0,
	`late_fee` real DEFAULT 0,
	`status` text DEFAULT 'pending' NOT NULL,
	`paid_date` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`phone` text,
	`address` text,
	`role_id` integer NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);