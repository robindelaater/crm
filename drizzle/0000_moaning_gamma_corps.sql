CREATE TABLE `client` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`role` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contract` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`contact_id` text,
	`project_id` text,
	`renewal_of_id` text,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`starts_on` text NOT NULL,
	`expires_on` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`billing_period` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`renewal_of_id`) REFERENCES `contract`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_on` text,
	`completed_on` text,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`vendor` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_on` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`billing_period` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL
);
