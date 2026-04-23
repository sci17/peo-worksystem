# Database (Django + SQLite)

This project already uses a SQLite database at `db.sqlite3` (see `my_site/settings.py`). Django manages the schema via migrations.

## Core tables used by the system

- `auth_user` (Django): user accounts.
- `my_app_userprofile`: extra settings per user (division, appearance, notifications, etc.).
- `my_app_shareddivisionstore`: **shared** JSON store per division key (`admin`, `planning`, `construction`, `quality`, `maintenance`). This is what the dashboards and the “Project Database” use.
- `my_app_divisionstore`: **per-user** JSON store (kept for backward compatibility / bootstrap).

## Maintenance Division (Road Management)

Road management data is stored as a JSON object inside the shared division store:

- Table: `my_app_shareddivisionstore`
- Key: `maintenance`
- Client cache: `localStorage` key `peo_maintenance_state_v1`
- Sync API: `GET/POST /api/division-store/maintenance/`

The payload is a single JSON object with these top-level arrays:

- `roadRecords`: provincial roads
  - Fields: `roadId`, `roadName`, `municipality`, `location`, `surfaceType`, `lengthKm`, `condition`
- `equipmentRows`: equipment inventory
  - Fields: `code`, `name`, `type`, `model`, `plateNumber`, `status`, `location`, `operator`
- `scheduleRows`: maintenance schedules
  - Fields: `title`, `road`, `type`, `priority`, `status`, `startDate`, `endDate`, `team`, `estimatedCost`, `notes`
- `taskRows`: maintenance task tracker
  - Fields: `slipNo`, `title`, `division`, `location`, `assignedTo`, `priority`, `status`, `dueDateIso`, `amount`, `notes`, plus `adminRecordId` when routed from Admin.
- `personnelRecords`: maintenance personnel roster
  - Fields: `fullName`, `employeeId`, `division`, `position`, `email`, `phone`, `divisionHead`
- `contractorRecords`: contractor registry
  - Fields: `name`, `tradeName`, `tin`, `philgeps`, `pcab`, `status`, `contracts`, `value`, `rating`, `classification`, `licenseExpiry`, `contactPerson`, `contactEmail`, `contactPhone`, `contactAddress`, `pcabLicense`, `address`, `contactCity`, `contactProvince`, `contactMobile`, `remarks`
- `dismissedAdminTaskIds`: Admin record ids dismissed in the Maintenance task table so they do not reappear on restore.

The road management UI and persistence logic live in `my_app/static/script.js` under the `ROAD_MAINTENANCE_SCRIPT_START` block (functions like `persistMaintenanceState`, `restoreMaintenanceState`, and road record normalization/helpers).

## Input persistence (important)

The UI writes most “form/table” changes via the API endpoint:

- `GET/POST /api/division-store/<key>/`

The latest state is stored in `my_app_shareddivisionstore.data` (or `my_app_divisionstore.data` in fallback mode).

To guarantee that **every submitted payload is stored even if the shared store gets overwritten later**, this repo now also logs each successful POST as an immutable event:

- `my_app_divisionstoreevent` (`DivisionStoreEvent` model)

Construction uploads are now also recorded in the DB:

- `my_app_constructionupload` (`ConstructionUpload` model)

## Normalized DB sync

Shared-store writes now also mirror key data into normalized Django tables:

- Admin store -> `my_app_workflow_record` and `my_app_division_submission`
- Maintenance store -> `my_app_maintenance_road`, `my_app_maintenance_equipment`, `my_app_maintenance_schedule`, `my_app_maintenance_personnel`, `my_app_maintenance_contractor`, `my_app_maintenance_task`

This means routed admin documents and maintenance task/state changes now leave a literal database footprint in addition to the JSON shared store. When a division-side delete hides or removes a record from the authoritative shared store, the corresponding normalized rows are also removed on the next successful sync write.

## Where to look in code

- Models: `my_app/models.py`
- Store API (GET/POST + clear-all): `my_app/views.py`
- Admin visibility: `my_app/admin.py`

