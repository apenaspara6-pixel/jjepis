CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`credential_version` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_sessions_expiry` ON `admin_sessions` (`expires_at`);