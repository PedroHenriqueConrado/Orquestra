-- CreateTable
CREATE TABLE `project_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(100) NULL,
    `created_by` INTEGER NOT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_template_creator`(`created_by`),
    INDEX `idx_template_category`(`category`),
    INDEX `idx_template_public`(`is_public`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_id` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    `estimated_hours` DOUBLE NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,

    INDEX `idx_tt_template`(`template_id`),
    INDEX `idx_tt_order`(`order_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `role` ENUM('developer', 'supervisor', 'tutor', 'project_manager', 'team_leader', 'admin') NOT NULL DEFAULT 'developer',

    INDEX `idx_tm_template`(`template_id`),
    INDEX `idx_tm_user`(`user_id`),
    UNIQUE INDEX `uq_template_user`(`template_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_templates` ADD CONSTRAINT `fk_template_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_tasks` ADD CONSTRAINT `fk_tt_template` FOREIGN KEY (`template_id`) REFERENCES `project_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_members` ADD CONSTRAINT `fk_tm_template` FOREIGN KEY (`template_id`) REFERENCES `project_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_members` ADD CONSTRAINT `fk_tm_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
