-- DropForeignKey
ALTER TABLE `articles` DROP FOREIGN KEY `Article_categoryId_fkey`;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `Article_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
