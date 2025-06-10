/*
  Warnings:

  - You are about to drop the `event_attendees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `event_attendees` DROP FOREIGN KEY `fk_ea_event`;

-- DropForeignKey
ALTER TABLE `event_attendees` DROP FOREIGN KEY `fk_ea_user`;

-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `fk_event_creator`;

-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `fk_event_project`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `profileImage` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `event_attendees`;

-- DropTable
DROP TABLE `events`;
