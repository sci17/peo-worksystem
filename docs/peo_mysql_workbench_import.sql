-- MySQL Workbench import script generated from SQLite schema
-- Source: db.sqlite3
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS peo_database;
CREATE DATABASE peo_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE peo_database;

-- Table: auth_group
CREATE TABLE auth_group (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name varchar(150) NOT NULL UNIQUE);

-- Table: auth_group_permissions
CREATE TABLE auth_group_permissions (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, group_id INT NOT NULL, permission_id INT NOT NULL);

-- Table: auth_permission
CREATE TABLE auth_permission (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, content_type_id INT NOT NULL, codename varchar(100) NOT NULL, name varchar(255) NOT NULL);

-- Table: auth_user
CREATE TABLE auth_user (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, password varchar(128) NOT NULL, last_login DATETIME NULL, is_superuser BOOLEAN NOT NULL, username varchar(150) NOT NULL UNIQUE, last_name varchar(150) NOT NULL, email varchar(254) NOT NULL, is_staff BOOLEAN NOT NULL, is_active BOOLEAN NOT NULL, date_joined DATETIME NOT NULL, first_name varchar(150) NOT NULL);

-- Table: auth_user_groups
CREATE TABLE auth_user_groups (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, group_id INT NOT NULL);

-- Table: auth_user_user_permissions
CREATE TABLE auth_user_user_permissions (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, permission_id INT NOT NULL);

-- Table: django_admin_log
CREATE TABLE django_admin_log (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, object_id text NULL, object_repr varchar(200) NOT NULL, action_flag SMALLINT UNSIGNED NOT NULL CHECK (action_flag >= 0), change_message text NOT NULL, content_type_id INT NULL, user_id INT NOT NULL, action_time DATETIME NOT NULL);

-- Table: django_content_type
CREATE TABLE django_content_type (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, app_label varchar(100) NOT NULL, model varchar(100) NOT NULL);

-- Table: django_migrations
CREATE TABLE django_migrations (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, app varchar(255) NOT NULL, name varchar(255) NOT NULL, applied DATETIME NOT NULL);

-- Table: django_session
CREATE TABLE django_session (session_key varchar(40) NOT NULL PRIMARY KEY, session_data text NOT NULL, expire_date DATETIME NOT NULL);

-- Table: my_app_construction_project
CREATE TABLE my_app_construction_project (id char(32) NOT NULL PRIMARY KEY, project_name varchar(255) NOT NULL, location text NULL, municipality varchar(120) NULL, contractor varchar(255) NULL, contract_cost decimal NULL, ntp_date date NULL, contract_duration_days INT UNSIGNED NULL CHECK (contract_duration_days >= 0), original_expiry_date date NULL, additional_cd_days INT UNSIGNED NULL CHECK (additional_cd_days >= 0), revised_expiry_date date NULL, date_completed date NULL, revised_contract_cost decimal NULL, status_previous_percent DOUBLE NULL, status_current_percent DOUBLE NULL, time_elapsed_percent DOUBLE NULL, slippage_percent DOUBLE NULL, remarks text NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, created_by_id INT NULL, workflow_record_id char(32) NULL UNIQUE);

-- Table: my_app_construction_task
CREATE TABLE my_app_construction_task (id char(32) NOT NULL PRIMARY KEY, task_name varchar(255) NOT NULL, assigned_to varchar(255) NULL, date_received DATETIME NULL, status varchar(60) NULL, remarks text NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, construction_project_id char(32) NULL, workflow_record_id char(32) NULL);

-- Table: my_app_constructionupload
CREATE TABLE my_app_constructionupload (id char(32) NOT NULL PRIMARY KEY, stored_name varchar(255) NOT NULL, original_name varchar(255) NOT NULL, url varchar(500) NOT NULL, content_type varchar(100) NOT NULL, size_bytes INT UNSIGNED NOT NULL CHECK (size_bytes >= 0), created_at DATETIME NOT NULL, uploaded_by_id INT NULL);

-- Table: my_app_division
CREATE TABLE my_app_division (`key` varchar(20) NOT NULL PRIMARY KEY, label varchar(120) NOT NULL UNIQUE, is_active BOOLEAN NOT NULL);

-- Table: my_app_division_submission
CREATE TABLE my_app_division_submission (id char(32) NOT NULL PRIMARY KEY, reference_no varchar(80) NULL, received_from varchar(255) NULL, received_at DATETIME NULL, status varchar(60) NULL, remarks text NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, division_key varchar(20) NOT NULL, submitted_by_id INT NULL, workflow_record_id char(32) NOT NULL, CONSTRAINT my_app_division_submission_unique_record_division UNIQUE (workflow_record_id, division_key));

-- Table: my_app_divisionstore
CREATE TABLE my_app_divisionstore (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `key` varchar(20) NOT NULL, data JSON NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, CONSTRAINT unique_division_store_per_user UNIQUE (user_id, `key`));

-- Table: my_app_divisionstoreevent
CREATE TABLE my_app_divisionstoreevent (id char(32) NOT NULL PRIMARY KEY, store_key varchar(20) NOT NULL, target varchar(10) NOT NULL, write_mode varchar(50) NOT NULL, request_payload JSON NULL, stored_payload JSON NULL, path varchar(255) NOT NULL, method varchar(10) NOT NULL, created_at DATETIME NOT NULL, actor_id INT NULL);

-- Table: my_app_maintenance_contractor
CREATE TABLE my_app_maintenance_contractor (id char(32) NOT NULL PRIMARY KEY, name varchar(255) NOT NULL, trade_name varchar(255) NULL, tin varchar(80) NULL UNIQUE, philgeps varchar(80) NULL, pcab varchar(80) NULL, status varchar(60) NULL, contracts INT UNSIGNED NULL CHECK (contracts >= 0), value decimal NULL, rating DOUBLE NULL, classification varchar(120) NULL, license_expiry date NULL, contact_person varchar(255) NULL, contact_email varchar(254) NULL, contact_phone varchar(60) NULL, contact_address text NULL, pcab_license varchar(120) NULL, address text NULL, contact_city varchar(120) NULL, contact_province varchar(120) NULL, contact_mobile varchar(60) NULL, remarks text NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL);

-- Table: my_app_maintenance_equipment
CREATE TABLE my_app_maintenance_equipment (id char(32) NOT NULL PRIMARY KEY, code varchar(60) NULL UNIQUE, name varchar(255) NOT NULL, type varchar(120) NULL, model varchar(120) NULL, plate_number varchar(60) NULL, status varchar(60) NULL, location varchar(255) NULL, operator varchar(255) NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL);

-- Table: my_app_maintenance_personnel
CREATE TABLE my_app_maintenance_personnel (id char(32) NOT NULL PRIMARY KEY, full_name varchar(255) NOT NULL, employee_id varchar(80) NULL UNIQUE, division varchar(120) NULL, position varchar(120) NULL, email varchar(254) NULL, phone varchar(60) NULL, division_head varchar(255) NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL);

-- Table: my_app_maintenance_road
CREATE TABLE my_app_maintenance_road (id char(32) NOT NULL PRIMARY KEY, road_id varchar(100) NULL UNIQUE, road_name varchar(255) NOT NULL, municipality varchar(120) NULL, location text NULL, surface_type varchar(80) NULL, length_km DOUBLE NULL, condition varchar(60) NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL);

-- Table: my_app_maintenance_schedule
CREATE TABLE my_app_maintenance_schedule (id char(32) NOT NULL PRIMARY KEY, title varchar(255) NOT NULL, road_ref varchar(255) NULL, type varchar(120) NULL, priority varchar(60) NULL, status varchar(60) NULL, start_date date NULL, end_date date NULL, team varchar(255) NULL, estimated_cost decimal NULL, notes text NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL);

-- Table: my_app_maintenance_task
CREATE TABLE my_app_maintenance_task (id char(32) NOT NULL PRIMARY KEY, admin_record_external_id varchar(64) NULL, slip_no varchar(64) NULL, title varchar(255) NOT NULL, division_label varchar(120) NULL, location text NULL, assigned_to varchar(255) NULL, priority varchar(60) NULL, status varchar(60) NULL, due_date date NULL, amount decimal NULL, notes text NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, workflow_record_id char(32) NULL);

-- Table: my_app_planning_record
CREATE TABLE my_app_planning_record (id char(32) NOT NULL PRIMARY KEY, budget_no varchar(80) NULL, project_name varchar(255) NULL, location text NULL, contractor varchar(255) NULL, contract_amount decimal NULL, revised_contract_amount decimal NULL, budget_allocation decimal NULL, status varchar(60) NULL, remarks text NULL, date_received DATETIME NULL, received_from varchar(255) NULL, payload JSON NULL, updated_at DATETIME NOT NULL, workflow_record_id char(32) NOT NULL UNIQUE);

-- Table: my_app_quality_record
CREATE TABLE my_app_quality_record (id char(32) NOT NULL PRIMARY KEY, received_from varchar(255) NULL, doc_date date NULL, particulars text NULL, doc_no varchar(100) NULL, billing_type varchar(120) NULL, project_location varchar(255) NULL, location_detail text NULL, scan_url text NULL, received_by varchar(255) NULL, date_recv DATETIME NULL, status varchar(60) NULL, payload JSON NULL, updated_at DATETIME NOT NULL, route_to_division_key varchar(20) NULL, workflow_record_id char(32) NOT NULL UNIQUE);

-- Table: my_app_shareddivisionstore
CREATE TABLE my_app_shareddivisionstore (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `key` varchar(20) NOT NULL UNIQUE, data JSON NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL);

-- Table: my_app_userprofile
CREATE TABLE my_app_userprofile (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, profile_picture varchar(100) NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL UNIQUE, appearance_mode varchar(10) NOT NULL, email_notifications BOOLEAN NOT NULL, portal_notifications BOOLEAN NOT NULL, division varchar(20) NULL);

-- Table: my_app_workflow_event
CREATE TABLE my_app_workflow_event (id char(32) NOT NULL PRIMARY KEY, action varchar(80) NOT NULL, status_after varchar(50) NULL, remarks text NULL, acted_at DATETIME NOT NULL, acted_by_id INT NULL, from_division_key varchar(20) NULL, to_division_key varchar(20) NULL, workflow_record_id char(32) NOT NULL);

-- Table: my_app_workflow_record
CREATE TABLE my_app_workflow_record (id char(32) NOT NULL PRIMARY KEY, source_admin_record_id varchar(64) NULL UNIQUE, slip_no varchar(64) NULL, document_name varchar(255) NOT NULL, project_name varchar(255) NULL, location text NULL, contractor varchar(255) NULL, billing_type varchar(120) NULL, contract_amount decimal NULL, revised_contract_amount decimal NULL, doc_status varchar(50) NOT NULL, billing_status varchar(50) NOT NULL, scanned_file_url text NULL, date_received DATETIME NULL, payload JSON NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, assigned_division_key varchar(20) NOT NULL, created_by_id INT NULL, submitted_from_division_key varchar(20) NULL);

-- Foreign keys: auth_group_permissions
ALTER TABLE auth_group_permissions ADD CONSTRAINT fk_auth_group_permissions_0 FOREIGN KEY (permission_id) REFERENCES auth_permission (id);
ALTER TABLE auth_group_permissions ADD CONSTRAINT fk_auth_group_permissions_1 FOREIGN KEY (group_id) REFERENCES auth_group (id);

-- Foreign keys: auth_permission
ALTER TABLE auth_permission ADD CONSTRAINT fk_auth_permission_0 FOREIGN KEY (content_type_id) REFERENCES django_content_type (id);

-- Foreign keys: auth_user_groups
ALTER TABLE auth_user_groups ADD CONSTRAINT fk_auth_user_groups_0 FOREIGN KEY (group_id) REFERENCES auth_group (id);
ALTER TABLE auth_user_groups ADD CONSTRAINT fk_auth_user_groups_1 FOREIGN KEY (user_id) REFERENCES auth_user (id);

-- Foreign keys: auth_user_user_permissions
ALTER TABLE auth_user_user_permissions ADD CONSTRAINT fk_auth_user_user_permissions_0 FOREIGN KEY (permission_id) REFERENCES auth_permission (id);
ALTER TABLE auth_user_user_permissions ADD CONSTRAINT fk_auth_user_user_permissions_1 FOREIGN KEY (user_id) REFERENCES auth_user (id);

-- Foreign keys: django_admin_log
ALTER TABLE django_admin_log ADD CONSTRAINT fk_django_admin_log_0 FOREIGN KEY (user_id) REFERENCES auth_user (id);
ALTER TABLE django_admin_log ADD CONSTRAINT fk_django_admin_log_1 FOREIGN KEY (content_type_id) REFERENCES django_content_type (id);

-- Foreign keys: my_app_construction_project
ALTER TABLE my_app_construction_project ADD CONSTRAINT fk_my_app_construction_project_0 FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record (id);
ALTER TABLE my_app_construction_project ADD CONSTRAINT fk_my_app_construction_project_1 FOREIGN KEY (created_by_id) REFERENCES auth_user (id);

-- Foreign keys: my_app_construction_task
ALTER TABLE my_app_construction_task ADD CONSTRAINT fk_my_app_construction_task_0 FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record (id);
ALTER TABLE my_app_construction_task ADD CONSTRAINT fk_my_app_construction_task_1 FOREIGN KEY (construction_project_id) REFERENCES my_app_construction_project (id);

-- Foreign keys: my_app_constructionupload
ALTER TABLE my_app_constructionupload ADD CONSTRAINT fk_my_app_constructionupload_0 FOREIGN KEY (uploaded_by_id) REFERENCES auth_user (id);

-- Foreign keys: my_app_division_submission
ALTER TABLE my_app_division_submission ADD CONSTRAINT fk_my_app_division_submission_0 FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record (id);
ALTER TABLE my_app_division_submission ADD CONSTRAINT fk_my_app_division_submission_1 FOREIGN KEY (submitted_by_id) REFERENCES auth_user (id);
ALTER TABLE my_app_division_submission ADD CONSTRAINT fk_my_app_division_submission_2 FOREIGN KEY (division_key) REFERENCES my_app_division (`key`);

-- Foreign keys: my_app_divisionstore
ALTER TABLE my_app_divisionstore ADD CONSTRAINT fk_my_app_divisionstore_0 FOREIGN KEY (user_id) REFERENCES auth_user (id);

-- Foreign keys: my_app_divisionstoreevent
ALTER TABLE my_app_divisionstoreevent ADD CONSTRAINT fk_my_app_divisionstoreevent_0 FOREIGN KEY (actor_id) REFERENCES auth_user (id);

-- Foreign keys: my_app_maintenance_task
ALTER TABLE my_app_maintenance_task ADD CONSTRAINT fk_my_app_maintenance_task_0 FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record (id);

-- Foreign keys: my_app_planning_record
ALTER TABLE my_app_planning_record ADD CONSTRAINT fk_my_app_planning_record_0 FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record (id);

-- Foreign keys: my_app_quality_record
ALTER TABLE my_app_quality_record ADD CONSTRAINT fk_my_app_quality_record_0 FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record (id);
ALTER TABLE my_app_quality_record ADD CONSTRAINT fk_my_app_quality_record_1 FOREIGN KEY (route_to_division_key) REFERENCES my_app_division (`key`);

-- Foreign keys: my_app_userprofile
ALTER TABLE my_app_userprofile ADD CONSTRAINT fk_my_app_userprofile_0 FOREIGN KEY (user_id) REFERENCES auth_user (id);

-- Foreign keys: my_app_workflow_event
ALTER TABLE my_app_workflow_event ADD CONSTRAINT fk_my_app_workflow_event_0 FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record (id);
ALTER TABLE my_app_workflow_event ADD CONSTRAINT fk_my_app_workflow_event_1 FOREIGN KEY (to_division_key) REFERENCES my_app_division (`key`);
ALTER TABLE my_app_workflow_event ADD CONSTRAINT fk_my_app_workflow_event_2 FOREIGN KEY (from_division_key) REFERENCES my_app_division (`key`);
ALTER TABLE my_app_workflow_event ADD CONSTRAINT fk_my_app_workflow_event_3 FOREIGN KEY (acted_by_id) REFERENCES auth_user (id);

-- Foreign keys: my_app_workflow_record
ALTER TABLE my_app_workflow_record ADD CONSTRAINT fk_my_app_workflow_record_0 FOREIGN KEY (submitted_from_division_key) REFERENCES my_app_division (`key`);
ALTER TABLE my_app_workflow_record ADD CONSTRAINT fk_my_app_workflow_record_1 FOREIGN KEY (created_by_id) REFERENCES auth_user (id);
ALTER TABLE my_app_workflow_record ADD CONSTRAINT fk_my_app_workflow_record_2 FOREIGN KEY (assigned_division_key) REFERENCES my_app_division (`key`);

-- Index: auth_group_permissions_group_id_b120cbf9 on auth_group_permissions
CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON auth_group_permissions (group_id);

-- Index: auth_group_permissions_group_id_permission_id_0cd325b0_uniq on auth_group_permissions
CREATE UNIQUE INDEX auth_group_permissions_group_id_permission_id_0cd325b0_uniq ON auth_group_permissions (group_id, permission_id);

-- Index: auth_group_permissions_permission_id_84c5c92e on auth_group_permissions
CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON auth_group_permissions (permission_id);

-- Index: auth_permission_content_type_id_2f476e4b on auth_permission
CREATE INDEX auth_permission_content_type_id_2f476e4b ON auth_permission (content_type_id);

-- Index: auth_permission_content_type_id_codename_01ab375a_uniq on auth_permission
CREATE UNIQUE INDEX auth_permission_content_type_id_codename_01ab375a_uniq ON auth_permission (content_type_id, codename);

-- Index: auth_user_groups_group_id_97559544 on auth_user_groups
CREATE INDEX auth_user_groups_group_id_97559544 ON auth_user_groups (group_id);

-- Index: auth_user_groups_user_id_6a12ed8b on auth_user_groups
CREATE INDEX auth_user_groups_user_id_6a12ed8b ON auth_user_groups (user_id);

-- Index: auth_user_groups_user_id_group_id_94350c0c_uniq on auth_user_groups
CREATE UNIQUE INDEX auth_user_groups_user_id_group_id_94350c0c_uniq ON auth_user_groups (user_id, group_id);

-- Index: auth_user_user_permissions_permission_id_1fbb5f2c on auth_user_user_permissions
CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON auth_user_user_permissions (permission_id);

-- Index: auth_user_user_permissions_user_id_a95ead1b on auth_user_user_permissions
CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON auth_user_user_permissions (user_id);

-- Index: auth_user_user_permissions_user_id_permission_id_14a6b632_uniq on auth_user_user_permissions
CREATE UNIQUE INDEX auth_user_user_permissions_user_id_permission_id_14a6b632_uniq ON auth_user_user_permissions (user_id, permission_id);

-- Index: django_admin_log_content_type_id_c4bce8eb on django_admin_log
CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON django_admin_log (content_type_id);

-- Index: django_admin_log_user_id_c564eba6 on django_admin_log
CREATE INDEX django_admin_log_user_id_c564eba6 ON django_admin_log (user_id);

-- Index: django_content_type_app_label_model_76bd3d3b_uniq on django_content_type
CREATE UNIQUE INDEX django_content_type_app_label_model_76bd3d3b_uniq ON django_content_type (app_label, model);

-- Index: django_session_expire_date_a5c62663 on django_session
CREATE INDEX django_session_expire_date_a5c62663 ON django_session (expire_date);

-- Index: my_app_cons_status__2bf071_idx on my_app_construction_project
CREATE INDEX my_app_cons_status__2bf071_idx ON my_app_construction_project (status_current_percent, updated_at);

-- Index: my_app_construction_project_created_by_id_67a7ab57 on my_app_construction_project
CREATE INDEX my_app_construction_project_created_by_id_67a7ab57 ON my_app_construction_project (created_by_id);

-- Index: my_app_cons_status_12bcd0_idx on my_app_construction_task
CREATE INDEX my_app_cons_status_12bcd0_idx ON my_app_construction_task (status, date_received);

-- Index: my_app_construction_task_construction_project_id_bb601ac5 on my_app_construction_task
CREATE INDEX my_app_construction_task_construction_project_id_bb601ac5 ON my_app_construction_task (construction_project_id);

-- Index: my_app_construction_task_workflow_record_id_6bfa359e on my_app_construction_task
CREATE INDEX my_app_construction_task_workflow_record_id_6bfa359e ON my_app_construction_task (workflow_record_id);

-- Index: my_app_cons_created_fe6a1e_idx on my_app_constructionupload
CREATE INDEX my_app_cons_created_fe6a1e_idx ON my_app_constructionupload (created_at);

-- Index: my_app_constructionupload_uploaded_by_id_0a169d2a on my_app_constructionupload
CREATE INDEX my_app_constructionupload_uploaded_by_id_0a169d2a ON my_app_constructionupload (uploaded_by_id);

-- Index: my_app_divi_divisio_e72606_idx on my_app_division_submission
CREATE INDEX my_app_divi_divisio_e72606_idx ON my_app_division_submission (division_key, status);

-- Index: my_app_division_submission_division_key_0ccc00fd on my_app_division_submission
CREATE INDEX my_app_division_submission_division_key_0ccc00fd ON my_app_division_submission (division_key);

-- Index: my_app_division_submission_submitted_by_id_8f26a3df on my_app_division_submission
CREATE INDEX my_app_division_submission_submitted_by_id_8f26a3df ON my_app_division_submission (submitted_by_id);

-- Index: my_app_division_submission_workflow_record_id_0bcd5b60 on my_app_division_submission
CREATE INDEX my_app_division_submission_workflow_record_id_0bcd5b60 ON my_app_division_submission (workflow_record_id);

-- Index: my_app_divisionstore_user_id_fc4e3ec6 on my_app_divisionstore
CREATE INDEX my_app_divisionstore_user_id_fc4e3ec6 ON my_app_divisionstore (user_id);

-- Index: my_app_divi_actor_i_624bd7_idx on my_app_divisionstoreevent
CREATE INDEX my_app_divi_actor_i_624bd7_idx ON my_app_divisionstoreevent (actor_id, created_at);

-- Index: my_app_divi_store_k_e9812e_idx on my_app_divisionstoreevent
CREATE INDEX my_app_divi_store_k_e9812e_idx ON my_app_divisionstoreevent (store_key, created_at);

-- Index: my_app_divisionstoreevent_actor_id_546f55a7 on my_app_divisionstoreevent
CREATE INDEX my_app_divisionstoreevent_actor_id_546f55a7 ON my_app_divisionstoreevent (actor_id);

-- Index: my_app_main_status_87e3b1_idx on my_app_maintenance_equipment
CREATE INDEX my_app_main_status_87e3b1_idx ON my_app_maintenance_equipment (status);

-- Index: my_app_main_conditi_e36814_idx on my_app_maintenance_road
CREATE INDEX my_app_main_conditi_e36814_idx ON my_app_maintenance_road (condition);

-- Index: my_app_main_status_edd6e2_idx on my_app_maintenance_schedule
CREATE INDEX my_app_main_status_edd6e2_idx ON my_app_maintenance_schedule (status, start_date);

-- Index: my_app_main_status_08bf69_idx on my_app_maintenance_task
CREATE INDEX my_app_main_status_08bf69_idx ON my_app_maintenance_task (status, due_date);

-- Index: my_app_maintenance_task_workflow_record_id_7803fbd3 on my_app_maintenance_task
CREATE INDEX my_app_maintenance_task_workflow_record_id_7803fbd3 ON my_app_maintenance_task (workflow_record_id);

-- Index: my_app_plan_status_e53099_idx on my_app_planning_record
CREATE INDEX my_app_plan_status_e53099_idx ON my_app_planning_record (status, date_received);

-- Index: my_app_qual_status_628bab_idx on my_app_quality_record
CREATE INDEX my_app_qual_status_628bab_idx ON my_app_quality_record (status, date_recv);

-- Index: my_app_quality_record_route_to_division_key_9cc7d803 on my_app_quality_record
CREATE INDEX my_app_quality_record_route_to_division_key_9cc7d803 ON my_app_quality_record (route_to_division_key);

-- Index: my_app_work_to_divi_a227a3_idx on my_app_workflow_event
CREATE INDEX my_app_work_to_divi_a227a3_idx ON my_app_workflow_event (to_division_key, acted_at);

-- Index: my_app_work_workflo_03dcc6_idx on my_app_workflow_event
CREATE INDEX my_app_work_workflo_03dcc6_idx ON my_app_workflow_event (workflow_record_id, acted_at);

-- Index: my_app_workflow_event_acted_by_id_1d94a088 on my_app_workflow_event
CREATE INDEX my_app_workflow_event_acted_by_id_1d94a088 ON my_app_workflow_event (acted_by_id);

-- Index: my_app_workflow_event_from_division_key_bd343bc8 on my_app_workflow_event
CREATE INDEX my_app_workflow_event_from_division_key_bd343bc8 ON my_app_workflow_event (from_division_key);

-- Index: my_app_workflow_event_to_division_key_2b3b23fd on my_app_workflow_event
CREATE INDEX my_app_workflow_event_to_division_key_2b3b23fd ON my_app_workflow_event (to_division_key);

-- Index: my_app_workflow_event_workflow_record_id_357a2d39 on my_app_workflow_event
CREATE INDEX my_app_workflow_event_workflow_record_id_357a2d39 ON my_app_workflow_event (workflow_record_id);

-- Index: my_app_work_assigne_4069ba_idx on my_app_workflow_record
CREATE INDEX my_app_work_assigne_4069ba_idx ON my_app_workflow_record (assigned_division_key);

-- Index: my_app_work_doc_sta_5fa506_idx on my_app_workflow_record
CREATE INDEX my_app_work_doc_sta_5fa506_idx ON my_app_workflow_record (doc_status, billing_status);

-- Index: my_app_workflow_record_assigned_division_key_df115650 on my_app_workflow_record
CREATE INDEX my_app_workflow_record_assigned_division_key_df115650 ON my_app_workflow_record (assigned_division_key);

-- Index: my_app_workflow_record_created_by_id_adaf764b on my_app_workflow_record
CREATE INDEX my_app_workflow_record_created_by_id_adaf764b ON my_app_workflow_record (created_by_id);

-- Index: my_app_workflow_record_submitted_from_division_key_f3265a5d on my_app_workflow_record
CREATE INDEX my_app_workflow_record_submitted_from_division_key_f3265a5d ON my_app_workflow_record (submitted_from_division_key);

-- Seed lookup data
INSERT INTO my_app_division (`key`, `label`, `is_active`) VALUES
('admin','Admin Division',1),
('planning','Planning Division',1),
('construction','Construction Division',1),
('quality','Quality Division',1),
('maintenance','Maintenance Division',1)
ON DUPLICATE KEY UPDATE label=VALUES(label), is_active=VALUES(is_active);

SET FOREIGN_KEY_CHECKS = 1;