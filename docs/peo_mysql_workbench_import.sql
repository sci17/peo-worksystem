-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema peo_database
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema peo_database
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `peo_database` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `peo_database` ;

-- -----------------------------------------------------
-- Table `peo_database`.`auth_group`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`auth_group` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name` (`name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`django_content_type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`django_content_type` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `app_label` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label` ASC, `model` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`auth_permission`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`auth_permission` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content_type_id` INT NOT NULL,
  `codename` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id` ASC, `codename` ASC) VISIBLE,
  INDEX `auth_permission_content_type_id_2f476e4b` (`content_type_id` ASC) VISIBLE,
  CONSTRAINT `fk_auth_permission_0`
    FOREIGN KEY (`content_type_id`)
    REFERENCES `peo_database`.`django_content_type` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`auth_group_permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`auth_group_permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `group_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id` ASC, `permission_id` ASC) VISIBLE,
  INDEX `auth_group_permissions_group_id_b120cbf9` (`group_id` ASC) VISIBLE,
  INDEX `auth_group_permissions_permission_id_84c5c92e` (`permission_id` ASC) VISIBLE,
  CONSTRAINT `fk_auth_group_permissions_0`
    FOREIGN KEY (`permission_id`)
    REFERENCES `peo_database`.`auth_permission` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_auth_group_permissions_1`
    FOREIGN KEY (`group_id`)
    REFERENCES `peo_database`.`auth_group` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`auth_user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`auth_user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `password` VARCHAR(128) NOT NULL,
  `last_login` DATETIME NULL DEFAULT NULL,
  `is_superuser` TINYINT(1) NOT NULL,
  `username` VARCHAR(150) NOT NULL,
  `last_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `is_staff` TINYINT(1) NOT NULL,
  `is_active` TINYINT(1) NOT NULL,
  `date_joined` DATETIME NOT NULL,
  `first_name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username` (`username` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`auth_user_groups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`auth_user_groups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `group_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id` ASC, `group_id` ASC) VISIBLE,
  INDEX `auth_user_groups_group_id_97559544` (`group_id` ASC) VISIBLE,
  INDEX `auth_user_groups_user_id_6a12ed8b` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_auth_user_groups_0`
    FOREIGN KEY (`group_id`)
    REFERENCES `peo_database`.`auth_group` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_auth_user_groups_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`auth_user_user_permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`auth_user_user_permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id` ASC, `permission_id` ASC) VISIBLE,
  INDEX `auth_user_user_permissions_permission_id_1fbb5f2c` (`permission_id` ASC) VISIBLE,
  INDEX `auth_user_user_permissions_user_id_a95ead1b` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_auth_user_user_permissions_0`
    FOREIGN KEY (`permission_id`)
    REFERENCES `peo_database`.`auth_permission` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_auth_user_user_permissions_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`django_admin_log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`django_admin_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `object_id` TEXT NULL DEFAULT NULL,
  `object_repr` VARCHAR(200) NOT NULL,
  `action_flag` SMALLINT UNSIGNED NOT NULL,
  `change_message` TEXT NOT NULL,
  `content_type_id` INT NULL DEFAULT NULL,
  `user_id` INT NOT NULL,
  `action_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `django_admin_log_content_type_id_c4bce8eb` (`content_type_id` ASC) VISIBLE,
  INDEX `django_admin_log_user_id_c564eba6` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_django_admin_log_0`
    FOREIGN KEY (`user_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_django_admin_log_1`
    FOREIGN KEY (`content_type_id`)
    REFERENCES `peo_database`.`django_content_type` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`django_migrations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`django_migrations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `app` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `applied` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`django_session`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`django_session` (
  `session_key` VARCHAR(40) NOT NULL,
  `session_data` TEXT NOT NULL,
  `expire_date` DATETIME NOT NULL,
  PRIMARY KEY (`session_key`),
  INDEX `django_session_expire_date_a5c62663` (`expire_date` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_division`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_division` (
  `key` VARCHAR(20) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `is_active` TINYINT(1) NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE INDEX `label` (`label` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_workflow_record`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_workflow_record` (
  `id` CHAR(32) NOT NULL,
  `source_admin_record_id` VARCHAR(64) NULL DEFAULT NULL,
  `slip_no` VARCHAR(64) NULL DEFAULT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `project_name` VARCHAR(255) NULL DEFAULT NULL,
  `location` TEXT NULL DEFAULT NULL,
  `contractor` VARCHAR(255) NULL DEFAULT NULL,
  `billing_type` VARCHAR(120) NULL DEFAULT NULL,
  `contract_amount` DECIMAL(18,2) NULL DEFAULT NULL,
  `revised_contract_amount` DECIMAL(18,2) NULL DEFAULT NULL,
  `doc_status` VARCHAR(50) NOT NULL,
  `billing_status` VARCHAR(50) NOT NULL,
  `scanned_file_url` TEXT NULL DEFAULT NULL,
  `date_received` DATETIME NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `assigned_division_key` VARCHAR(20) NOT NULL,
  `created_by_id` INT NULL DEFAULT NULL,
  `submitted_from_division_key` VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `source_admin_record_id` (`source_admin_record_id` ASC) VISIBLE,
  INDEX `my_app_work_assigne_4069ba_idx` (`assigned_division_key` ASC) VISIBLE,
  INDEX `my_app_work_doc_sta_5fa506_idx` (`doc_status` ASC, `billing_status` ASC) VISIBLE,
  INDEX `my_app_workflow_record_assigned_division_key_df115650` (`assigned_division_key` ASC) VISIBLE,
  INDEX `my_app_workflow_record_created_by_id_adaf764b` (`created_by_id` ASC) VISIBLE,
  INDEX `my_app_workflow_record_submitted_from_division_key_f3265a5d` (`submitted_from_division_key` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_workflow_record_0`
    FOREIGN KEY (`submitted_from_division_key`)
    REFERENCES `peo_database`.`my_app_division` (`key`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_my_app_workflow_record_1`
    FOREIGN KEY (`created_by_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_my_app_workflow_record_2`
    FOREIGN KEY (`assigned_division_key`)
    REFERENCES `peo_database`.`my_app_division` (`key`)
    ON DELETE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_construction_project`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_construction_project` (
  `id` CHAR(32) NOT NULL,
  `project_name` VARCHAR(255) NOT NULL,
  `location` TEXT NULL DEFAULT NULL,
  `municipality` VARCHAR(120) NULL DEFAULT NULL,
  `contractor` VARCHAR(255) NULL DEFAULT NULL,
  `contract_cost` DECIMAL(18,2) NULL DEFAULT NULL,
  `ntp_date` DATE NULL DEFAULT NULL,
  `contract_duration_days` INT UNSIGNED NULL DEFAULT NULL,
  `original_expiry_date` DATE NULL DEFAULT NULL,
  `additional_cd_days` INT UNSIGNED NULL DEFAULT NULL,
  `revised_expiry_date` DATE NULL DEFAULT NULL,
  `date_completed` DATE NULL DEFAULT NULL,
  `revised_contract_cost` DECIMAL(18,2) NULL DEFAULT NULL,
  `status_previous_percent` DOUBLE NULL DEFAULT NULL,
  `status_current_percent` DOUBLE NULL DEFAULT NULL,
  `time_elapsed_percent` DOUBLE NULL DEFAULT NULL,
  `slippage_percent` DOUBLE NULL DEFAULT NULL,
  `remarks` TEXT NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `created_by_id` INT NULL DEFAULT NULL,
  `workflow_record_id` CHAR(32) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `workflow_record_id` (`workflow_record_id` ASC) VISIBLE,
  INDEX `my_app_cons_status__2bf071_idx` (`status_current_percent` ASC, `updated_at` ASC) VISIBLE,
  INDEX `my_app_construction_project_created_by_id_67a7ab57` (`created_by_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_construction_project_0`
    FOREIGN KEY (`workflow_record_id`)
    REFERENCES `peo_database`.`my_app_workflow_record` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_my_app_construction_project_1`
    FOREIGN KEY (`created_by_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_construction_task`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_construction_task` (
  `id` CHAR(32) NOT NULL,
  `task_name` VARCHAR(255) NOT NULL,
  `assigned_to` VARCHAR(255) NULL DEFAULT NULL,
  `date_received` DATETIME NULL DEFAULT NULL,
  `status` VARCHAR(60) NULL DEFAULT NULL,
  `remarks` TEXT NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `construction_project_id` CHAR(32) NULL DEFAULT NULL,
  `workflow_record_id` CHAR(32) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `my_app_cons_status_12bcd0_idx` (`status` ASC, `date_received` ASC) VISIBLE,
  INDEX `my_app_construction_task_construction_project_id_bb601ac5` (`construction_project_id` ASC) VISIBLE,
  INDEX `my_app_construction_task_workflow_record_id_6bfa359e` (`workflow_record_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_construction_task_0`
    FOREIGN KEY (`workflow_record_id`)
    REFERENCES `peo_database`.`my_app_workflow_record` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_my_app_construction_task_1`
    FOREIGN KEY (`construction_project_id`)
    REFERENCES `peo_database`.`my_app_construction_project` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_constructionupload`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_constructionupload` (
  `id` CHAR(32) NOT NULL,
  `stored_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `content_type` VARCHAR(100) NOT NULL,
  `size_bytes` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL,
  `uploaded_by_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `my_app_cons_created_fe6a1e_idx` (`created_at` ASC) VISIBLE,
  INDEX `my_app_constructionupload_uploaded_by_id_0a169d2a` (`uploaded_by_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_constructionupload_0`
    FOREIGN KEY (`uploaded_by_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_division_submission`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_division_submission` (
  `id` CHAR(32) NOT NULL,
  `reference_no` VARCHAR(80) NULL DEFAULT NULL,
  `received_from` VARCHAR(255) NULL DEFAULT NULL,
  `received_at` DATETIME NULL DEFAULT NULL,
  `status` VARCHAR(60) NULL DEFAULT NULL,
  `remarks` TEXT NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `division_key` VARCHAR(20) NOT NULL,
  `submitted_by_id` INT NULL DEFAULT NULL,
  `workflow_record_id` CHAR(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `my_app_division_submission_unique_record_division` (`workflow_record_id` ASC, `division_key` ASC) VISIBLE,
  INDEX `my_app_divi_divisio_e72606_idx` (`division_key` ASC, `status` ASC) VISIBLE,
  INDEX `my_app_division_submission_division_key_0ccc00fd` (`division_key` ASC) VISIBLE,
  INDEX `my_app_division_submission_submitted_by_id_8f26a3df` (`submitted_by_id` ASC) VISIBLE,
  INDEX `my_app_division_submission_workflow_record_id_0bcd5b60` (`workflow_record_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_division_submission_0`
    FOREIGN KEY (`workflow_record_id`)
    REFERENCES `peo_database`.`my_app_workflow_record` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_my_app_division_submission_1`
    FOREIGN KEY (`submitted_by_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_my_app_division_submission_2`
    FOREIGN KEY (`division_key`)
    REFERENCES `peo_database`.`my_app_division` (`key`)
    ON DELETE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_divisionstore`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_divisionstore` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(20) NOT NULL,
  `data` JSON NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_division_store_per_user` (`user_id` ASC, `key` ASC) VISIBLE,
  INDEX `my_app_divisionstore_user_id_fc4e3ec6` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_divisionstore_0`
    FOREIGN KEY (`user_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_divisionstoreevent`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_divisionstoreevent` (
  `id` CHAR(32) NOT NULL,
  `store_key` VARCHAR(20) NOT NULL,
  `target` VARCHAR(10) NOT NULL,
  `write_mode` VARCHAR(50) NOT NULL,
  `request_payload` JSON NULL DEFAULT NULL,
  `stored_payload` JSON NULL DEFAULT NULL,
  `path` VARCHAR(255) NOT NULL,
  `method` VARCHAR(10) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `actor_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `my_app_divi_actor_i_624bd7_idx` (`actor_id` ASC, `created_at` ASC) VISIBLE,
  INDEX `my_app_divi_store_k_e9812e_idx` (`store_key` ASC, `created_at` ASC) VISIBLE,
  INDEX `my_app_divisionstoreevent_actor_id_546f55a7` (`actor_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_divisionstoreevent_0`
    FOREIGN KEY (`actor_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_maintenance_contractor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_maintenance_contractor` (
  `id` CHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `trade_name` VARCHAR(255) NULL DEFAULT NULL,
  `tin` VARCHAR(80) NULL DEFAULT NULL,
  `philgeps` VARCHAR(80) NULL DEFAULT NULL,
  `pcab` VARCHAR(80) NULL DEFAULT NULL,
  `status` VARCHAR(60) NULL DEFAULT NULL,
  `contracts` INT UNSIGNED NULL DEFAULT NULL,
  `value` DECIMAL(18,2) NULL DEFAULT NULL,
  `rating` DOUBLE NULL DEFAULT NULL,
  `classification` VARCHAR(120) NULL DEFAULT NULL,
  `license_expiry` DATE NULL DEFAULT NULL,
  `contact_person` VARCHAR(255) NULL DEFAULT NULL,
  `contact_email` VARCHAR(254) NULL DEFAULT NULL,
  `contact_phone` VARCHAR(60) NULL DEFAULT NULL,
  `contact_address` TEXT NULL DEFAULT NULL,
  `pcab_license` VARCHAR(120) NULL DEFAULT NULL,
  `address` TEXT NULL DEFAULT NULL,
  `contact_city` VARCHAR(120) NULL DEFAULT NULL,
  `contact_province` VARCHAR(120) NULL DEFAULT NULL,
  `contact_mobile` VARCHAR(60) NULL DEFAULT NULL,
  `remarks` TEXT NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `tin` (`tin` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_maintenance_equipment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_maintenance_equipment` (
  `id` CHAR(32) NOT NULL,
  `code` VARCHAR(60) NULL DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(120) NULL DEFAULT NULL,
  `model` VARCHAR(120) NULL DEFAULT NULL,
  `plate_number` VARCHAR(60) NULL DEFAULT NULL,
  `status` VARCHAR(60) NULL DEFAULT NULL,
  `location` VARCHAR(255) NULL DEFAULT NULL,
  `operator` VARCHAR(255) NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `code` (`code` ASC) VISIBLE,
  INDEX `my_app_main_status_87e3b1_idx` (`status` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_maintenance_personnel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_maintenance_personnel` (
  `id` CHAR(32) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `employee_id` VARCHAR(80) NULL DEFAULT NULL,
  `division` VARCHAR(120) NULL DEFAULT NULL,
  `position` VARCHAR(120) NULL DEFAULT NULL,
  `email` VARCHAR(254) NULL DEFAULT NULL,
  `phone` VARCHAR(60) NULL DEFAULT NULL,
  `division_head` VARCHAR(255) NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `employee_id` (`employee_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_maintenance_road`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_maintenance_road` (
  `id` CHAR(32) NOT NULL,
  `road_id` VARCHAR(100) NULL DEFAULT NULL,
  `road_name` VARCHAR(255) NOT NULL,
  `municipality` VARCHAR(120) NULL DEFAULT NULL,
  `location` TEXT NULL DEFAULT NULL,
  `surface_type` VARCHAR(80) NULL DEFAULT NULL,
  `length_km` DOUBLE NULL DEFAULT NULL,
  `condition` VARCHAR(60) NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `road_id` (`road_id` ASC) VISIBLE,
  INDEX `my_app_main_conditi_e36814_idx` (`condition` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_maintenance_schedule`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_maintenance_schedule` (
  `id` CHAR(32) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `road_ref` VARCHAR(255) NULL DEFAULT NULL,
  `type` VARCHAR(120) NULL DEFAULT NULL,
  `priority` VARCHAR(60) NULL DEFAULT NULL,
  `status` VARCHAR(60) NULL DEFAULT NULL,
  `start_date` DATE NULL DEFAULT NULL,
  `end_date` DATE NULL DEFAULT NULL,
  `team` VARCHAR(255) NULL DEFAULT NULL,
  `estimated_cost` DECIMAL(18,2) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `my_app_main_status_edd6e2_idx` (`status` ASC, `start_date` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_maintenance_task`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_maintenance_task` (
  `id` CHAR(32) NOT NULL,
  `admin_record_external_id` VARCHAR(64) NULL DEFAULT NULL,
  `slip_no` VARCHAR(64) NULL DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `division_label` VARCHAR(120) NULL DEFAULT NULL,
  `location` TEXT NULL DEFAULT NULL,
  `assigned_to` VARCHAR(255) NULL DEFAULT NULL,
  `priority` VARCHAR(60) NULL DEFAULT NULL,
  `status` VARCHAR(60) NULL DEFAULT NULL,
  `due_date` DATE NULL DEFAULT NULL,
  `amount` DECIMAL(18,2) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `workflow_record_id` CHAR(32) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `my_app_main_status_08bf69_idx` (`status` ASC, `due_date` ASC) VISIBLE,
  INDEX `my_app_maintenance_task_workflow_record_id_7803fbd3` (`workflow_record_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_maintenance_task_0`
    FOREIGN KEY (`workflow_record_id`)
    REFERENCES `peo_database`.`my_app_workflow_record` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_planning_record`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_planning_record` (
  `id` CHAR(32) NOT NULL,
  `budget_no` VARCHAR(80) NULL DEFAULT NULL,
  `project_name` VARCHAR(255) NULL DEFAULT NULL,
  `location` TEXT NULL DEFAULT NULL,
  `contractor` VARCHAR(255) NULL DEFAULT NULL,
  `contract_amount` DECIMAL(18,2) NULL DEFAULT NULL,
  `revised_contract_amount` DECIMAL(18,2) NULL DEFAULT NULL,
  `budget_allocation` DECIMAL(18,2) NULL DEFAULT NULL,
  `status` VARCHAR(60) NULL DEFAULT NULL,
  `remarks` TEXT NULL DEFAULT NULL,
  `date_received` DATETIME NULL DEFAULT NULL,
  `received_from` VARCHAR(255) NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `updated_at` DATETIME NOT NULL,
  `workflow_record_id` CHAR(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `workflow_record_id` (`workflow_record_id` ASC) VISIBLE,
  INDEX `my_app_plan_status_e53099_idx` (`status` ASC, `date_received` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_planning_record_0`
    FOREIGN KEY (`workflow_record_id`)
    REFERENCES `peo_database`.`my_app_workflow_record` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_quality_record`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_quality_record` (
  `id` CHAR(32) NOT NULL,
  `received_from` VARCHAR(255) NULL DEFAULT NULL,
  `doc_date` DATE NULL DEFAULT NULL,
  `particulars` TEXT NULL DEFAULT NULL,
  `doc_no` VARCHAR(100) NULL DEFAULT NULL,
  `billing_type` VARCHAR(120) NULL DEFAULT NULL,
  `project_location` VARCHAR(255) NULL DEFAULT NULL,
  `location_detail` TEXT NULL DEFAULT NULL,
  `scan_url` TEXT NULL DEFAULT NULL,
  `received_by` VARCHAR(255) NULL DEFAULT NULL,
  `date_recv` DATETIME NULL DEFAULT NULL,
  `status` VARCHAR(60) NULL DEFAULT NULL,
  `payload` JSON NULL DEFAULT NULL,
  `updated_at` DATETIME NOT NULL,
  `route_to_division_key` VARCHAR(20) NULL DEFAULT NULL,
  `workflow_record_id` CHAR(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `workflow_record_id` (`workflow_record_id` ASC) VISIBLE,
  INDEX `my_app_qual_status_628bab_idx` (`status` ASC, `date_recv` ASC) VISIBLE,
  INDEX `my_app_quality_record_route_to_division_key_9cc7d803` (`route_to_division_key` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_quality_record_0`
    FOREIGN KEY (`workflow_record_id`)
    REFERENCES `peo_database`.`my_app_workflow_record` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_my_app_quality_record_1`
    FOREIGN KEY (`route_to_division_key`)
    REFERENCES `peo_database`.`my_app_division` (`key`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_shareddivisionstore`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_shareddivisionstore` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(20) NOT NULL,
  `data` JSON NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `key` (`key` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_userprofile`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_userprofile` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `profile_picture` VARCHAR(100) NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `user_id` INT NOT NULL,
  `appearance_mode` VARCHAR(10) NOT NULL,
  `email_notifications` TINYINT(1) NOT NULL,
  `portal_notifications` TINYINT(1) NOT NULL,
  `division` VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_userprofile_0`
    FOREIGN KEY (`user_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `peo_database`.`my_app_workflow_event`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `peo_database`.`my_app_workflow_event` (
  `id` CHAR(32) NOT NULL,
  `action` VARCHAR(80) NOT NULL,
  `status_after` VARCHAR(50) NULL DEFAULT NULL,
  `remarks` TEXT NULL DEFAULT NULL,
  `acted_at` DATETIME NOT NULL,
  `acted_by_id` INT NULL DEFAULT NULL,
  `from_division_key` VARCHAR(20) NULL DEFAULT NULL,
  `to_division_key` VARCHAR(20) NULL DEFAULT NULL,
  `workflow_record_id` CHAR(32) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `my_app_work_to_divi_a227a3_idx` (`to_division_key` ASC, `acted_at` ASC) VISIBLE,
  INDEX `my_app_work_workflo_03dcc6_idx` (`workflow_record_id` ASC, `acted_at` ASC) VISIBLE,
  INDEX `my_app_workflow_event_acted_by_id_1d94a088` (`acted_by_id` ASC) VISIBLE,
  INDEX `my_app_workflow_event_from_division_key_bd343bc8` (`from_division_key` ASC) VISIBLE,
  INDEX `my_app_workflow_event_to_division_key_2b3b23fd` (`to_division_key` ASC) VISIBLE,
  INDEX `my_app_workflow_event_workflow_record_id_357a2d39` (`workflow_record_id` ASC) VISIBLE,
  CONSTRAINT `fk_my_app_workflow_event_0`
    FOREIGN KEY (`workflow_record_id`)
    REFERENCES `peo_database`.`my_app_workflow_record` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_my_app_workflow_event_1`
    FOREIGN KEY (`to_division_key`)
    REFERENCES `peo_database`.`my_app_division` (`key`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_my_app_workflow_event_2`
    FOREIGN KEY (`from_division_key`)
    REFERENCES `peo_database`.`my_app_division` (`key`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_my_app_workflow_event_3`
    FOREIGN KEY (`acted_by_id`)
    REFERENCES `peo_database`.`auth_user` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
