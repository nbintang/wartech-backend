/*
  Warnings:

  - A unique constraint covering the columns `[userId,token,type]` on the table `VerificationToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `verificationtoken` DROP FOREIGN KEY `VerificationToken_userId_fkey`;

-- DropIndex
DROP INDEX `VerificationToken_userId_token_key` ON `verificationtoken`;

-- AlterTable
ALTER TABLE `verificationtoken` ADD COLUMN `type` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `VerificationToken_userId_token_type_key` ON `VerificationToken`(`userId`, `token`, `type`);

-- AddForeignKey
ALTER TABLE `VerificationToken` ADD CONSTRAINT `VerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
