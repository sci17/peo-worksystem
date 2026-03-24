-- PEO Worksystem - Full Database Schema (SQLite)
-- Purpose:
-- 1) Define the core framework/auth tables needed by the system.
-- 2) Define the current my_app tables used by Django views/API.
-- 3) Define normalized domain tables so entities, attributes, and relationships
--    are explicitly connected across Admin, Planning, Construction, Quality,
--    and Maintenance workflows.

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- ============================================================
-- 0) Lookup / master entity
-- ============================================================
CREATE TABLE IF NOT EXISTS my_app_division (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

INSERT OR IGNORE INTO my_app_division (key, label, is_active) VALUES
    ('admin', 'Admin Division', 1),
    ('planning', 'Planning Division', 1),
    ('construction', 'Construction Division', 1),
    ('quality', 'Quality Division', 1),
    ('maintenance', 'Maintenance Division', 1);

-- ============================================================
-- 1) Django core/auth entities (required system tables)
-- ============================================================
CREATE TABLE IF NOT EXISTS django_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS django_content_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    UNIQUE (app_label, model)
);

CREATE TABLE IF NOT EXISTS auth_group (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS auth_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    is_superuser INTEGER NOT NULL CHECK (is_superuser IN (0, 1)),
    username VARCHAR(150) NOT NULL UNIQUE,
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL DEFAULT '',
    is_staff INTEGER NOT NULL CHECK (is_staff IN (0, 1)),
    is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
    date_joined DATETIME NOT NULL,
    first_name VARCHAR(150) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS auth_permission (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type_id INTEGER NOT NULL,
    codename VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (content_type_id) REFERENCES django_content_type(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (content_type_id, codename)
);

CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES auth_group(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permission_id) REFERENCES auth_permission(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS auth_user_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (group_id) REFERENCES auth_group(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (user_id, group_id)
);

CREATE TABLE IF NOT EXISTS auth_user_user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permission_id) REFERENCES auth_permission(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS django_admin_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    object_id TEXT NULL,
    object_repr VARCHAR(200) NOT NULL,
    action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
    change_message TEXT NOT NULL,
    content_type_id INTEGER NULL,
    user_id INTEGER NOT NULL,
    action_time DATETIME NOT NULL,
    FOREIGN KEY (content_type_id) REFERENCES django_content_type(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS django_session (
    session_key VARCHAR(40) PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date DATETIME NOT NULL
);

-- ============================================================
-- 2) Current app entities used by existing code
-- ============================================================
CREATE TABLE IF NOT EXISTS my_app_userprofile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    profile_picture VARCHAR(100) NOT NULL DEFAULT '',
    appearance_mode VARCHAR(10) NOT NULL DEFAULT 'light'
        CHECK (appearance_mode IN ('light', 'system', 'dark')),
    email_notifications INTEGER NOT NULL DEFAULT 1 CHECK (email_notifications IN (0, 1)),
    portal_notifications INTEGER NOT NULL DEFAULT 1 CHECK (portal_notifications IN (0, 1)),
    division VARCHAR(20) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (division) REFERENCES my_app_division(key)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS my_app_shareddivisionstore (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(20) NOT NULL UNIQUE,
    data TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(data)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (key) REFERENCES my_app_division(key)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS my_app_divisionstore (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    key VARCHAR(20) NOT NULL,
    data TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(data)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (key) REFERENCES my_app_division(key)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT unique_division_store_per_user UNIQUE (user_id, key)
);

CREATE TABLE IF NOT EXISTS my_app_divisionstoreevent (
    id CHAR(32) PRIMARY KEY,
    actor_id INTEGER NULL,
    store_key VARCHAR(20) NOT NULL,
    target VARCHAR(10) NOT NULL CHECK (target IN ('shared', 'user')),
    write_mode VARCHAR(50) NOT NULL DEFAULT '',
    request_payload TEXT NULL CHECK (request_payload IS NULL OR json_valid(request_payload)),
    stored_payload TEXT NULL CHECK (stored_payload IS NULL OR json_valid(stored_payload)),
    path VARCHAR(255) NOT NULL DEFAULT '',
    method VARCHAR(10) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES auth_user(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (store_key) REFERENCES my_app_division(key)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS my_app_constructionupload (
    id CHAR(32) PRIMARY KEY,
    uploaded_by_id INTEGER NULL,
    stored_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL DEFAULT '',
    url VARCHAR(500) NOT NULL DEFAULT '',
    content_type VARCHAR(100) NOT NULL DEFAULT '',
    size_bytes INTEGER NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by_id) REFERENCES auth_user(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

-- Seed one shared row per division key (matches current API behavior)
INSERT OR IGNORE INTO my_app_shareddivisionstore (key, data, created_at, updated_at) VALUES
    ('admin', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('planning', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('construction', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('quality', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('maintenance', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================
-- 3) Normalized domain entities (aligned relationships)
-- ============================================================
-- Canonical cross-division document/project record anchored by Admin routing.
CREATE TABLE IF NOT EXISTS my_app_workflow_record (
    id CHAR(32) PRIMARY KEY,
    source_admin_record_id VARCHAR(64) NULL UNIQUE,
    slip_no VARCHAR(64) NULL,
    document_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NULL,
    location TEXT NULL,
    contractor VARCHAR(255) NULL,
    billing_type VARCHAR(120) NULL,
    contract_amount NUMERIC NULL CHECK (contract_amount IS NULL OR contract_amount >= 0),
    revised_contract_amount NUMERIC NULL CHECK (revised_contract_amount IS NULL OR revised_contract_amount >= 0),
    assigned_division_key VARCHAR(20) NOT NULL,
    doc_status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    billing_status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    scanned_file_url TEXT NULL,
    date_received DATETIME NULL,
    submitted_from_division_key VARCHAR(20) NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_by_id INTEGER NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_division_key) REFERENCES my_app_division(key)
        ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (submitted_from_division_key) REFERENCES my_app_division(key)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (created_by_id) REFERENCES auth_user(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS my_app_workflow_event (
    id CHAR(32) PRIMARY KEY,
    workflow_record_id CHAR(32) NOT NULL,
    from_division_key VARCHAR(20) NULL,
    to_division_key VARCHAR(20) NULL,
    action VARCHAR(80) NOT NULL,
    status_after VARCHAR(50) NULL,
    remarks TEXT NULL,
    acted_by_id INTEGER NULL,
    acted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (from_division_key) REFERENCES my_app_division(key)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (to_division_key) REFERENCES my_app_division(key)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (acted_by_id) REFERENCES auth_user(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

-- One per record per division (planning/construction/quality/maintenance submissions).
CREATE TABLE IF NOT EXISTS my_app_division_submission (
    id CHAR(32) PRIMARY KEY,
    workflow_record_id CHAR(32) NOT NULL,
    division_key VARCHAR(20) NOT NULL,
    reference_no VARCHAR(80) NULL,
    received_from VARCHAR(255) NULL,
    received_at DATETIME NULL,
    status VARCHAR(60) NULL,
    remarks TEXT NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    submitted_by_id INTEGER NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (division_key) REFERENCES my_app_division(key)
        ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (submitted_by_id) REFERENCES auth_user(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    UNIQUE (workflow_record_id, division_key)
);

-- Planning details (entity attributes from planning table/forms).
CREATE TABLE IF NOT EXISTS my_app_planning_record (
    id CHAR(32) PRIMARY KEY,
    workflow_record_id CHAR(32) NOT NULL UNIQUE,
    budget_no VARCHAR(80) NULL,
    project_name VARCHAR(255) NULL,
    location TEXT NULL,
    contractor VARCHAR(255) NULL,
    contract_amount NUMERIC NULL CHECK (contract_amount IS NULL OR contract_amount >= 0),
    revised_contract_amount NUMERIC NULL CHECK (revised_contract_amount IS NULL OR revised_contract_amount >= 0),
    budget_allocation NUMERIC NULL CHECK (budget_allocation IS NULL OR budget_allocation >= 0),
    status VARCHAR(60) NULL,
    remarks TEXT NULL,
    date_received DATETIME NULL,
    received_from VARCHAR(255) NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

-- Construction project entity.
CREATE TABLE IF NOT EXISTS my_app_construction_project (
    id CHAR(32) PRIMARY KEY,
    workflow_record_id CHAR(32) NULL UNIQUE,
    project_name VARCHAR(255) NOT NULL,
    location TEXT NULL,
    municipality VARCHAR(120) NULL,
    contractor VARCHAR(255) NULL,
    contract_cost NUMERIC NULL CHECK (contract_cost IS NULL OR contract_cost >= 0),
    ntp_date DATE NULL,
    contract_duration_days INTEGER NULL CHECK (contract_duration_days IS NULL OR contract_duration_days >= 0),
    original_expiry_date DATE NULL,
    additional_cd_days INTEGER NULL CHECK (additional_cd_days IS NULL OR additional_cd_days >= 0),
    revised_expiry_date DATE NULL,
    date_completed DATE NULL,
    revised_contract_cost NUMERIC NULL CHECK (revised_contract_cost IS NULL OR revised_contract_cost >= 0),
    status_previous_percent REAL NULL CHECK (status_previous_percent IS NULL OR (status_previous_percent >= 0 AND status_previous_percent <= 100)),
    status_current_percent REAL NULL CHECK (status_current_percent IS NULL OR (status_current_percent >= 0 AND status_current_percent <= 100)),
    time_elapsed_percent REAL NULL CHECK (time_elapsed_percent IS NULL OR (time_elapsed_percent >= 0 AND time_elapsed_percent <= 100)),
    slippage_percent REAL NULL,
    remarks TEXT NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_by_id INTEGER NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (created_by_id) REFERENCES auth_user(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS my_app_construction_task (
    id CHAR(32) PRIMARY KEY,
    construction_project_id CHAR(32) NULL,
    workflow_record_id CHAR(32) NULL,
    task_name VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255) NULL,
    date_received DATETIME NULL,
    status VARCHAR(60) NULL,
    remarks TEXT NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (construction_project_id) REFERENCES my_app_construction_project(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

-- Quality entity.
CREATE TABLE IF NOT EXISTS my_app_quality_record (
    id CHAR(32) PRIMARY KEY,
    workflow_record_id CHAR(32) NOT NULL UNIQUE,
    received_from VARCHAR(255) NULL,
    doc_date DATE NULL,
    particulars TEXT NULL,
    doc_no VARCHAR(100) NULL,
    billing_type VARCHAR(120) NULL,
    project_location VARCHAR(255) NULL,
    location_detail TEXT NULL,
    scan_url TEXT NULL,
    route_to_division_key VARCHAR(20) NULL,
    received_by VARCHAR(255) NULL,
    date_recv DATETIME NULL,
    status VARCHAR(60) NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record(id)
        ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (route_to_division_key) REFERENCES my_app_division(key)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

-- Maintenance entities.
CREATE TABLE IF NOT EXISTS my_app_maintenance_road (
    id CHAR(32) PRIMARY KEY,
    road_id VARCHAR(100) NULL,
    road_name VARCHAR(255) NOT NULL,
    municipality VARCHAR(120) NULL,
    location TEXT NULL,
    surface_type VARCHAR(80) NULL,
    length_km REAL NULL CHECK (length_km IS NULL OR length_km >= 0),
    condition VARCHAR(60) NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (road_id)
);

CREATE TABLE IF NOT EXISTS my_app_maintenance_equipment (
    id CHAR(32) PRIMARY KEY,
    code VARCHAR(60) NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(120) NULL,
    model VARCHAR(120) NULL,
    plate_number VARCHAR(60) NULL,
    status VARCHAR(60) NULL,
    location VARCHAR(255) NULL,
    operator VARCHAR(255) NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS my_app_maintenance_schedule (
    id CHAR(32) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    road_ref VARCHAR(255) NULL,
    type VARCHAR(120) NULL,
    priority VARCHAR(60) NULL,
    status VARCHAR(60) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    team VARCHAR(255) NULL,
    estimated_cost NUMERIC NULL CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
    notes TEXT NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS my_app_maintenance_personnel (
    id CHAR(32) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(80) NULL,
    division VARCHAR(120) NULL,
    position VARCHAR(120) NULL,
    email VARCHAR(254) NULL,
    phone VARCHAR(60) NULL,
    division_head VARCHAR(255) NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id)
);

CREATE TABLE IF NOT EXISTS my_app_maintenance_contractor (
    id CHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NULL,
    tin VARCHAR(80) NULL,
    philgeps VARCHAR(80) NULL,
    pcab VARCHAR(80) NULL,
    status VARCHAR(60) NULL,
    contracts INTEGER NULL CHECK (contracts IS NULL OR contracts >= 0),
    value NUMERIC NULL CHECK (value IS NULL OR value >= 0),
    rating REAL NULL,
    classification VARCHAR(120) NULL,
    license_expiry DATE NULL,
    contact_person VARCHAR(255) NULL,
    contact_email VARCHAR(254) NULL,
    contact_phone VARCHAR(60) NULL,
    contact_address TEXT NULL,
    pcab_license VARCHAR(120) NULL,
    address TEXT NULL,
    contact_city VARCHAR(120) NULL,
    contact_province VARCHAR(120) NULL,
    contact_mobile VARCHAR(60) NULL,
    remarks TEXT NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tin)
);

CREATE TABLE IF NOT EXISTS my_app_maintenance_task (
    id CHAR(32) PRIMARY KEY,
    workflow_record_id CHAR(32) NULL,
    admin_record_external_id VARCHAR(64) NULL,
    slip_no VARCHAR(64) NULL,
    title VARCHAR(255) NOT NULL,
    division_label VARCHAR(120) NULL,
    location TEXT NULL,
    assigned_to VARCHAR(255) NULL,
    priority VARCHAR(60) NULL,
    status VARCHAR(60) NULL,
    due_date DATE NULL,
    amount NUMERIC NULL CHECK (amount IS NULL OR amount >= 0),
    notes TEXT NULL,
    payload TEXT NULL CHECK (payload IS NULL OR json_valid(payload)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_record_id) REFERENCES my_app_workflow_record(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================
-- 4) Relationship/support indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS auth_permission_content_type_id_2f476e4b
    ON auth_permission (content_type_id);

CREATE INDEX IF NOT EXISTS auth_group_permissions_group_id_b120cbf9
    ON auth_group_permissions (group_id);
CREATE INDEX IF NOT EXISTS auth_group_permissions_permission_id_84c5c92e
    ON auth_group_permissions (permission_id);

CREATE INDEX IF NOT EXISTS auth_user_groups_user_id_6a12ed8b
    ON auth_user_groups (user_id);
CREATE INDEX IF NOT EXISTS auth_user_groups_group_id_97559544
    ON auth_user_groups (group_id);

CREATE INDEX IF NOT EXISTS auth_user_user_permissions_user_id_a95ead1b
    ON auth_user_user_permissions (user_id);
CREATE INDEX IF NOT EXISTS auth_user_user_permissions_permission_id_1fbb5f2c
    ON auth_user_user_permissions (permission_id);

CREATE INDEX IF NOT EXISTS django_admin_log_content_type_id_c4bce8eb
    ON django_admin_log (content_type_id);
CREATE INDEX IF NOT EXISTS django_admin_log_user_id_c564eba6
    ON django_admin_log (user_id);
CREATE INDEX IF NOT EXISTS django_session_expire_date_a5c62663
    ON django_session (expire_date);

CREATE INDEX IF NOT EXISTS my_app_divisionstore_user_id_fc4e3ec6
    ON my_app_divisionstore (user_id);
CREATE INDEX IF NOT EXISTS my_app_divi_store_k_e9812e_idx
    ON my_app_divisionstoreevent (store_key, created_at);
CREATE INDEX IF NOT EXISTS my_app_divi_actor_i_624bd7_idx
    ON my_app_divisionstoreevent (actor_id, created_at);
CREATE INDEX IF NOT EXISTS my_app_constructionupload_uploaded_by_id_0a169d2a
    ON my_app_constructionupload (uploaded_by_id);
CREATE INDEX IF NOT EXISTS my_app_cons_created_fe6a1e_idx
    ON my_app_constructionupload (created_at);

CREATE INDEX IF NOT EXISTS my_app_workflow_record_assigned_division_idx
    ON my_app_workflow_record (assigned_division_key);
CREATE INDEX IF NOT EXISTS my_app_workflow_record_status_idx
    ON my_app_workflow_record (doc_status, billing_status);
CREATE INDEX IF NOT EXISTS my_app_workflow_event_record_idx
    ON my_app_workflow_event (workflow_record_id, acted_at);
CREATE INDEX IF NOT EXISTS my_app_workflow_event_to_division_idx
    ON my_app_workflow_event (to_division_key, acted_at);

CREATE INDEX IF NOT EXISTS my_app_division_submission_division_status_idx
    ON my_app_division_submission (division_key, status);

CREATE INDEX IF NOT EXISTS my_app_planning_record_status_idx
    ON my_app_planning_record (status, date_received);
CREATE INDEX IF NOT EXISTS my_app_construction_project_status_idx
    ON my_app_construction_project (status_current_percent, updated_at);
CREATE INDEX IF NOT EXISTS my_app_construction_task_status_idx
    ON my_app_construction_task (status, date_received);
CREATE INDEX IF NOT EXISTS my_app_quality_record_status_idx
    ON my_app_quality_record (status, date_recv);

CREATE INDEX IF NOT EXISTS my_app_maintenance_road_condition_idx
    ON my_app_maintenance_road (condition);
CREATE INDEX IF NOT EXISTS my_app_maintenance_equipment_status_idx
    ON my_app_maintenance_equipment (status);
CREATE INDEX IF NOT EXISTS my_app_maintenance_schedule_status_idx
    ON my_app_maintenance_schedule (status, start_date);
CREATE INDEX IF NOT EXISTS my_app_maintenance_task_status_idx
    ON my_app_maintenance_task (status, due_date);

COMMIT;

-- End of schema.
