-- Notes:
-- - Table names follow Django defaults (app_label + modelname).
-- - This file is intended as a reference for the queries behind the system’s main functions/endpoints.
-- - Prefer Django ORM in code; these are equivalent raw-SQL examples for SQLite.

-- ============================================================
-- Account settings (views.account_settings + AccountSettingsForm)
-- ============================================================

-- Read user + profile
SELECT id, username, first_name, last_name, email
FROM auth_user
WHERE id = :user_id;

SELECT id, user_id, division, email_notifications, portal_notifications, appearance_mode, updated_at
FROM my_app_userprofile
WHERE user_id = :user_id;

-- Update user identity fields
UPDATE auth_user
SET first_name = :first_name,
    last_name = :last_name,
    email = :email
WHERE id = :user_id;

-- Update profile preferences
UPDATE my_app_userprofile
SET email_notifications = :email_notifications,
    portal_notifications = :portal_notifications,
    appearance_mode = :appearance_mode,
    division = :division,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = :user_id;

-- ============================================================
-- Division store API (views.division_store_api)
-- Endpoint: GET/POST /api/division-store/<key>/
-- ============================================================

-- Read shared store payload (normal mode)
SELECT id, key, data, updated_at
FROM my_app_shareddivisionstore
WHERE key = :store_key;

-- Read per-user store payload (fallback / backward compat)
SELECT id, user_id, key, data, updated_at
FROM my_app_divisionstore
WHERE user_id = :user_id
  AND key = :store_key;

-- Write shared store payload (POST)
UPDATE my_app_shareddivisionstore
SET data = :json_payload,
    updated_at = CURRENT_TIMESTAMP
WHERE key = :store_key;

-- If no row exists yet (first write), insert then future writes update
INSERT INTO my_app_shareddivisionstore (key, data, created_at, updated_at)
VALUES (:store_key, :json_payload, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Audit log: every successful POST is stored immutably
INSERT INTO my_app_divisionstoreevent (
    id, actor_id, store_key, target, write_mode,
    request_payload, stored_payload, path, method, created_at
) VALUES (
    :uuid, :actor_id, :store_key, :target, :write_mode,
    :request_payload_json, :stored_payload_json, :path, :method, CURRENT_TIMESTAMP
);

-- ============================================================
-- Clear-all API (views.division_store_clear_all_api)
-- Endpoint: POST /api/division-store-clear-all/
-- ============================================================

-- Wipe shared stores
UPDATE my_app_shareddivisionstore
SET data = CASE
    WHEN key = 'maintenance' THEN '{}'
    ELSE '[]'
END,
updated_at = CURRENT_TIMESTAMP
WHERE key IN ('admin', 'planning', 'construction', 'quality', 'maintenance');

-- Best-effort: remove per-user stores so shared store can’t be re-seeded from old data
DELETE FROM my_app_divisionstore
WHERE key IN ('admin', 'planning', 'construction', 'quality', 'maintenance');

-- ============================================================
-- Project database (views.project_dashboard)
-- ============================================================

-- Reads shared store seed for all divisions
SELECT key, data, updated_at
FROM my_app_shareddivisionstore
WHERE key IN ('admin', 'planning', 'construction', 'quality', 'maintenance');

-- ============================================================
-- Construction uploads (views.construction_photo_upload)
-- Endpoint: POST /api/uploads/construction/
-- ============================================================

-- Insert upload metadata (files are written to /static/uploads on disk)
INSERT INTO my_app_constructionupload (
    id, uploaded_by_id, stored_name, original_name, url, content_type, size_bytes, created_at
) VALUES (
    :uuid, :user_id, :stored_name, :original_name, :url, :content_type, :size_bytes, CURRENT_TIMESTAMP
);

-- List recent uploads
SELECT id, uploaded_by_id, original_name, url, size_bytes, content_type, created_at
FROM my_app_constructionupload
ORDER BY created_at DESC
LIMIT 50;

