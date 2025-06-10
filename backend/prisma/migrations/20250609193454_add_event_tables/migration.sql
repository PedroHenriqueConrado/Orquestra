-- CreateTable
CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `start_time` DATETIME(0) NOT NULL,
    `end_time` DATETIME(0) NOT NULL,
    `all_day` BOOLEAN NOT NULL DEFAULT false,
    `location` VARCHAR(200) NULL,
    `color` VARCHAR(7) NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_event_project`(`project_id`),
    INDEX `idx_event_creator`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_attendees` (
    `event_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `status` ENUM('pending', 'accepted', 'declined', 'tentative') NOT NULL DEFAULT 'pending',

    INDEX `idx_ea_event`(`event_id`),
    INDEX `idx_ea_user`(`user_id`),
    PRIMARY KEY (`event_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `fk_event_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `fk_event_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_attendees` ADD CONSTRAINT `fk_ea_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_attendees` ADD CONSTRAINT `fk_ea_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
