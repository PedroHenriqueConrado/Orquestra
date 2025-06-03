/*
  Warnings:

  - Added the required column `mime_type` to the `document_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `document_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `document_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document_versions` ADD COLUMN `is_compressed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mime_type` VARCHAR(100) NOT NULL,
    ADD COLUMN `original_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `size` INTEGER NOT NULL;
