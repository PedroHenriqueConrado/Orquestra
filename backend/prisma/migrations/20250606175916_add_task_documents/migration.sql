-- CreateTable
CREATE TABLE `task_documents` (
    `task_id` INTEGER NOT NULL,
    `document_id` INTEGER NOT NULL,
    `added_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `added_by` INTEGER NOT NULL,

    INDEX `idx_td_task`(`task_id`),
    INDEX `idx_td_document`(`document_id`),
    INDEX `idx_td_added_by`(`added_by`),
    PRIMARY KEY (`task_id`, `document_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `task_documents` ADD CONSTRAINT `fk_td_task` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_documents` ADD CONSTRAINT `fk_td_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_documents` ADD CONSTRAINT `fk_td_user` FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
