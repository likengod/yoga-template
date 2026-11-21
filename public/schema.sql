-- CreateTable
CREATE TABLE IF NOT EXISTS `about_content` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `founder_bio` TEXT NULL,
    `founder_image` VARCHAR(191) NULL,
    `founder_name` VARCHAR(191) NULL,
    `founder_title` VARCHAR(191) NULL,
    `hero_image` VARCHAR(191) NULL,
    `hero_subtitle` VARCHAR(191) NULL,
    `hero_title` VARCHAR(191) NULL,
    `mission` TEXT NULL,
    `section_image` VARCHAR(191) NULL,
    `story` TEXT NULL,
    `values` TEXT NULL,
    `vision` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `articles` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `excerpt` TEXT NULL,
    `image_url` VARCHAR(191) NULL,
    `published` BOOLEAN NULL DEFAULT false,
    `featured` BOOLEAN NULL DEFAULT false,
    `views` INTEGER NULL DEFAULT 0,
    `seo_title` TEXT NULL,
    `seo_description` TEXT NULL,
    `seo_keywords` TEXT NULL,
    `canonical_url` TEXT NULL,
    `geo_region` VARCHAR(191) NULL,
    `geo_placename` VARCHAR(191) NULL,
    `geo_position` VARCHAR(191) NULL,
    `aeo_key_takeaways` TEXT NULL,
    `aeo_faq_json` TEXT NULL,

    INDEX `articles_published_created_at_idx`(`published`, `created_at`),
    INDEX `articles_featured_idx`(`featured`),
    INDEX `articles_category_idx`(`category`),
    INDEX `articles_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `class_type` VARCHAR(191) NULL,
    `experience` VARCHAR(191) NULL,
    `preferred_date` VARCHAR(191) NULL,
    `preferred_time` VARCHAR(191) NULL,
    `special_requests` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL DEFAULT 'pending',
    `instructor` VARCHAR(191) NULL,

    INDEX `bookings_status_created_at_idx`(`status`, `created_at`),
    INDEX `bookings_email_idx`(`email`),
    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_phone_idx`(`phone`),
    INDEX `bookings_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `contact_content` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `hero_title` VARCHAR(191) NULL,
    `hero_subtitle` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `email` VARCHAR(191) NULL,
    `hours` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `gallery_images` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `views` INTEGER NULL DEFAULT 0,

    INDEX `gallery_images_views_idx`(`views`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `popup_settings` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `enabled` BOOLEAN NULL DEFAULT false,
    `title` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `button_text` VARCHAR(191) NULL,
    `button_url` VARCHAR(191) NULL,
    `delay` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `products` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `priceUSD` DOUBLE NULL,
    `image_url` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `whatsapp_message` VARCHAR(191) NULL,
    `stock_quantity` INTEGER NULL DEFAULT 0,
    `is_available` BOOLEAN NULL DEFAULT true,
    `is_featured` BOOLEAN NULL DEFAULT false,
    `buy_action` VARCHAR(191) NULL DEFAULT 'whatsapp',
    `external_link` TEXT NULL,

    INDEX `products_category_idx`(`category`),
    INDEX `products_is_available_idx`(`is_available`),
    INDEX `products_is_featured_idx`(`is_featured`),
    INDEX `products_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `home_content` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `heroTitle` VARCHAR(191) NULL,
    `heroSubtitle` VARCHAR(191) NULL,
    `heroImage` VARCHAR(191) NULL,
    `heroButtonText` VARCHAR(191) NULL,
    `heroStats` VARCHAR(191) NULL,
    `aboutTitle` VARCHAR(191) NULL,
    `aboutDescription` VARCHAR(191) NULL,
    `aboutPhilosophy1` VARCHAR(191) NULL,
    `aboutPhilosophy2` VARCHAR(191) NULL,
    `aboutButtonText` VARCHAR(191) NULL,
    `aboutImage` VARCHAR(191) NULL,
    `aboutFeatures` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `files` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `dimensions` VARCHAR(191) NULL,
    `uploadDate` VARCHAR(191) NULL,

    INDEX `files_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `instructors` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `experience` VARCHAR(191) NULL,
    `certifications` VARCHAR(191) NULL,
    `rating` DOUBLE NULL DEFAULT 0,
    `students` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `twitter` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `featured` BOOLEAN NULL DEFAULT false,
    `signature_url` VARCHAR(191) NULL,
    `tiktok` VARCHAR(191) NULL,
    `connected_user` VARCHAR(191) NULL,

    INDEX `instructors_featured_idx`(`featured`),
    INDEX `instructors_connected_user_idx`(`connected_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `online_classes` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `instructor` VARCHAR(191) NULL,
    `classStarting` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `price` VARCHAR(191) NULL,
    `priceUSD` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `capacity` VARCHAR(191) NULL,
    `schedule` VARCHAR(191) NULL,
    `level` VARCHAR(191) NULL,
    `rating` DOUBLE NULL DEFAULT 0,
    `features` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `joinLink` VARCHAR(191) NULL,
    `maxSeats` INTEGER NULL DEFAULT 0,
    `availableSeats` INTEGER NULL DEFAULT 0,
    `featured` BOOLEAN NULL DEFAULT false,

    INDEX `online_classes_featured_created_at_idx`(`featured`, `created_at`),
    INDEX `online_classes_featured_idx`(`featured`),
    INDEX `online_classes_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `policy_pages` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `policy_pages_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `yoga_certificates` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `certificateId` VARCHAR(191) NOT NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `courseName` VARCHAR(191) NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `instructorName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `signature_url` VARCHAR(191) NULL,

    UNIQUE INDEX `yoga_certificates_certificateId_key`(`certificateId`),
    INDEX `yoga_certificates_phone_idx`(`phone`),
    INDEX `yoga_certificates_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `phone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `seo_settings` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `keywords` VARCHAR(191) NULL,
    `robotsTxt` TEXT NULL,
    `sitemapXml` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `site_settings` (
    `id` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `faviconUrl` VARCHAR(191) NULL,
    `socialLinks` TEXT NULL,
    `businessName` VARCHAR(191) NULL,
    `businessEmail` VARCHAR(191) NULL,
    `businessPhone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `capacity` VARCHAR(191) NOT NULL,
    `joinUrl` VARCHAR(191) NOT NULL,
    `buttonText` VARCHAR(191) NULL,
    `buttonUrl` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `events_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(191) NOT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_company` VARCHAR(191) NULL,
    `customer_email` VARCHAR(191) NOT NULL,
    `customer_phone` VARCHAR(191) NULL,
    `customer_address` VARCHAR(191) NULL,
    `customer_city` VARCHAR(191) NULL,
    `customer_state` VARCHAR(191) NULL,
    `customer_zip` VARCHAR(191) NULL,
    `customer_country` VARCHAR(191) NULL,
    `issue_date` VARCHAR(191) NOT NULL,
    `due_date` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `tax_amount` DOUBLE NOT NULL DEFAULT 0,
    `total_amount` DOUBLE NOT NULL DEFAULT 0,
    `items_json` TEXT NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    INDEX `invoices_status_idx`(`status`),
    INDEX `invoices_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `billing_settings` (
    `id` VARCHAR(191) NOT NULL,
    `gst_rate` DOUBLE NOT NULL DEFAULT 18,
    `service_charge` DOUBLE NOT NULL DEFAULT 1,
    `company_name` VARCHAR(191) NULL,
    `company_email` VARCHAR(191) NULL,
    `company_phone` VARCHAR(191) NULL,
    `tax_id_type` VARCHAR(191) NULL DEFAULT 'PAN',
    `pan` VARCHAR(191) NULL,
    `license_no` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `zip_code` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,
    `account_name` VARCHAR(191) NULL,
    `account_number` VARCHAR(191) NULL,
    `ifsc_code` VARCHAR(191) NULL,
    `upi_id` VARCHAR(191) NULL,
    `qr_code_url` TEXT NULL,
    `company_logo_url` TEXT NULL,
    `authorized_signature_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `promo_codes` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discount_type` VARCHAR(191) NOT NULL DEFAULT 'percentage',
    `discount_value` DOUBLE NOT NULL DEFAULT 0,
    `min_order_amount` DOUBLE NULL,
    `max_uses` INTEGER NULL,
    `used_count` INTEGER NULL DEFAULT 0,
    `expiry_date` VARCHAR(191) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `promo_codes_code_key`(`code`),
    INDEX `promo_codes_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Default Admin User
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `phone`, `created_at`, `updated_at`)
VALUES ('admin-01', 'admin', 'admin@shaktiyogaraai.com', 'Agartala@54321', 'admin', '', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `password` = 'Agartala@54321', `role` = 'admin';

