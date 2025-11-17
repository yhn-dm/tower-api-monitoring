-- CreateTable
CREATE TABLE `Provider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(64) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `logoUrl` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Provider_slug_key`(`slug`),
    INDEX `Provider_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Endpoint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `url` VARCHAR(512) NOT NULL,
    `method` VARCHAR(8) NOT NULL DEFAULT 'GET',
    `region` VARCHAR(32) NOT NULL DEFAULT 'global',
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Endpoint_providerId_idx`(`providerId`),
    INDEX `Endpoint_providerId_isEnabled_idx`(`providerId`, `isEnabled`),
    INDEX `Endpoint_url_idx`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckResult` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `endpointId` INTEGER NOT NULL,
    `status` ENUM('UP', 'DOWN', 'TIMEOUT', 'ERROR') NOT NULL,
    `httpStatus` SMALLINT NULL,
    `latencyMs` INTEGER NULL,
    `responseSizeBytes` INTEGER NOT NULL DEFAULT 0,
    `error` VARCHAR(255) NULL,
    `checkedAt` DATETIME(3) NOT NULL,
    `region` VARCHAR(32) NOT NULL DEFAULT 'global',

    INDEX `CheckResult_endpointId_checkedAt_idx`(`endpointId`, `checkedAt`),
    INDEX `CheckResult_checkedAt_idx`(`checkedAt`),
    INDEX `CheckResult_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IncidentEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NULL,
    `type` ENUM('DOWN', 'SLOW', 'ERROR') NOT NULL,
    `message` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IncidentEvent_providerId_idx`(`providerId`),
    INDEX `IncidentEvent_startAt_idx`(`startAt`),
    INDEX `IncidentEvent_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Endpoint` ADD CONSTRAINT `Endpoint_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckResult` ADD CONSTRAINT `CheckResult_endpointId_fkey` FOREIGN KEY (`endpointId`) REFERENCES `Endpoint`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IncidentEvent` ADD CONSTRAINT `IncidentEvent_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
