/*
  Warnings:

  - You are about to drop the `verification_tokens_user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `verification_tokens_user` DROP FOREIGN KEY `VerificationToken_userId_fkey`;

-- DropTable
DROP TABLE `verification_tokens_user`;
