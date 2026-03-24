# Database (Django + SQLite)

This project already uses a SQLite database at `db.sqlite3` (see `my_site/settings.py`). Django manages the schema via migrations.

## Core tables used by the system

- `auth_user` (Django): user accounts.
- `my_app_userprofile`: extra settings per user (division, appearance, notifications, etc.).
- `my_app_shareddivisionstore`: **shared** JSON store per division key (`admin`, `planning`, `construction`, `quality`, `maintenance`). This is what the dashboards and the “Project Database” use.
- `my_app_divisionstore`: **per-user** JSON store (kept for backward compatibility / bootstrap).

## Input persistence (important)

The UI writes most “form/table” changes via the API endpoint:

- `GET/POST /api/division-store/<key>/`

The latest state is stored in `my_app_shareddivisionstore.data` (or `my_app_divisionstore.data` in fallback mode).

To guarantee that **every submitted payload is stored even if the shared store gets overwritten later**, this repo now also logs each successful POST as an immutable event:

- `my_app_divisionstoreevent` (`DivisionStoreEvent` model)

Construction uploads are now also recorded in the DB:

- `my_app_constructionupload` (`ConstructionUpload` model)

## Where to look in code

- Models: `my_app/models.py`
- Store API (GET/POST + clear-all): `my_app/views.py`
- Admin visibility: `my_app/admin.py`

