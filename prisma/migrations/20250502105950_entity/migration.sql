/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `article` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `article` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `article` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `name` on the `category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to drop the column `emailVerified` on the `user` table. All the data in the column will be lost.
  - Added the required column `image` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `article` DROP COLUMN `imageUrl`,
    DROP COLUMN `isPublished`,
    ADD COLUMN `image` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    MODIFY `title` VARCHAR(100) NOT NULL,
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `category` MODIFY `name` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `emailVerified`,
    ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL;
