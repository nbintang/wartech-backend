-- This is an empty migration.

ALTER TABLE `users`
  MODIFY `name` VARCHAR(255) CHARACTER SET `utf8mb4` COLLATE `utf8mb4_unicode_ci`,
  MODIFY `email` VARCHAR(255) CHARACTER SET `utf8mb4` COLLATE `utf8mb4_unicode_ci`;