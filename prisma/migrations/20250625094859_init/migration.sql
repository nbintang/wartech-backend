/*
  Warnings:

  - You are about to drop the column `articleId` on the `likes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,commentId]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commentId` to the `likes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `Like_articleId_fkey`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `Like_userId_fkey`;

-- DropIndex
DROP INDEX `Like_articleId_fkey` ON `likes`;

-- DropIndex
DROP INDEX `Like_userId_articleId_key` ON `likes`;

-- AlterTable
ALTER TABLE `comments` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `likes` DROP COLUMN `articleId`,
    ADD COLUMN `commentId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Like_commentId_fkey` ON `likes`(`commentId`);

-- CreateIndex
CREATE UNIQUE INDEX `Like_userId_commentId_key` ON `likes`(`userId`, `commentId`);

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `Like_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `Like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
