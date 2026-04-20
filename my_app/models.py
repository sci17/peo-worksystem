import os
import uuid

from django.conf import settings
from django.db import models


def user_profile_picture_path(instance, filename):
    extension = os.path.splitext(filename)[1].lower() or '.png'
    return f'user_profiles/{instance.user_id}/{uuid.uuid4().hex}{extension}'

KEY_ADMIN = 'admin'
KEY_PLANNING = 'planning'
KEY_CONSTRUCTION = 'construction'
KEY_QUALITY = 'quality'
KEY_MAINTENANCE = 'maintenance'
DIVISION_KEY_CHOICES = [
    (KEY_ADMIN, 'Admin Division'),
    (KEY_PLANNING, 'Planning Division'),
    (KEY_CONSTRUCTION, 'Construction Division'),
    (KEY_QUALITY, 'Quality Division'),
    (KEY_MAINTENANCE, 'Maintenance Division'),
]


class UserProfile(models.Model):
    APPEARANCE_LIGHT = 'light'
    APPEARANCE_SYSTEM = 'system'
    APPEARANCE_DARK = 'dark'
    APPEARANCE_CHOICES = [
        (APPEARANCE_LIGHT, 'Light'),
        (APPEARANCE_SYSTEM, 'System'),
        (APPEARANCE_DARK, 'Dark'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to=user_profile_picture_path, blank=True)
    email_notifications = models.BooleanField(default=True)
    portal_notifications = models.BooleanField(default=True)
    appearance_mode = models.CharField(max_length=10, choices=APPEARANCE_CHOICES, default=APPEARANCE_LIGHT)
    division = models.CharField(
        max_length=20,
        choices=DIVISION_KEY_CHOICES,
        blank=True,
        null=True,
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.get_username()} profile'


class DivisionStore(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='division_stores',
    )
    key = models.CharField(max_length=20, choices=DIVISION_KEY_CHOICES)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'key'], name='unique_division_store_per_user'),
        ]

    def __str__(self):
        return f'{self.user.get_username()} {self.key} store'


class SharedDivisionStore(models.Model):
    # Global store per division key (shared across users).
    KEY_CHOICES = DIVISION_KEY_CHOICES

    key = models.CharField(max_length=20, choices=KEY_CHOICES, unique=True)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.key} shared store'


class DivisionStoreEvent(models.Model):
    TARGET_SHARED = "shared"
    TARGET_USER = "user"
    TARGET_CHOICES = [
        (TARGET_SHARED, "Shared"),
        (TARGET_USER, "User"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="division_store_events",
    )
    store_key = models.CharField(max_length=20, choices=DIVISION_KEY_CHOICES)
    target = models.CharField(max_length=10, choices=TARGET_CHOICES)
    write_mode = models.CharField(max_length=50, blank=True)
    request_payload = models.JSONField(null=True, blank=True)
    stored_payload = models.JSONField(null=True, blank=True)
    path = models.CharField(max_length=255, blank=True)
    method = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["store_key", "created_at"]),
            models.Index(fields=["actor", "created_at"]),
        ]

    def __str__(self):
        actor = self.actor.get_username() if self.actor else "anonymous"
        return f"{actor} {self.store_key} event"


class ConstructionUpload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="construction_uploads",
    )
    stored_name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255, blank=True)
    url = models.CharField(max_length=500, blank=True)
    content_type = models.CharField(max_length=100, blank=True)
    size_bytes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.original_name or self.stored_name


class Division(models.Model):
    key = models.CharField(max_length=20, primary_key=True, choices=DIVISION_KEY_CHOICES)
    label = models.CharField(max_length=120, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "my_app_division"

    def __str__(self):
        return self.label


class WorkflowRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_admin_record_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    slip_no = models.CharField(max_length=64, null=True, blank=True)
    document_name = models.CharField(max_length=255)
    project_name = models.CharField(max_length=255, null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    contractor = models.CharField(max_length=255, null=True, blank=True)
    billing_type = models.CharField(max_length=120, null=True, blank=True)
    contract_amount = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    revised_contract_amount = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    assigned_division = models.ForeignKey(
        Division,
        on_delete=models.RESTRICT,
        related_name="assigned_workflow_records",
        db_column="assigned_division_key",
    )
    doc_status = models.CharField(max_length=50, default="Draft")
    billing_status = models.CharField(max_length=50, default="Draft")
    scanned_file_url = models.TextField(null=True, blank=True)
    date_received = models.DateTimeField(null=True, blank=True)
    submitted_from_division = models.ForeignKey(
        Division,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_workflow_records",
        db_column="submitted_from_division_key",
    )
    payload = models.JSONField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_workflow_records",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_workflow_record"
        indexes = [
            models.Index(fields=["assigned_division"]),
            models.Index(fields=["doc_status", "billing_status"]),
        ]

    def __str__(self):
        return self.document_name


class WorkflowEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_record = models.ForeignKey(
        WorkflowRecord,
        on_delete=models.CASCADE,
        related_name="events",
    )
    from_division = models.ForeignKey(
        Division,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events_from",
        db_column="from_division_key",
    )
    to_division = models.ForeignKey(
        Division,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events_to",
        db_column="to_division_key",
    )
    action = models.CharField(max_length=80)
    status_after = models.CharField(max_length=50, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    acted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="workflow_events",
    )
    acted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "my_app_workflow_event"
        indexes = [
            models.Index(fields=["workflow_record", "acted_at"]),
            models.Index(fields=["to_division", "acted_at"]),
        ]

    def __str__(self):
        return f"{self.action} ({self.workflow_record_id})"


class DivisionSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_record = models.ForeignKey(
        WorkflowRecord,
        on_delete=models.CASCADE,
        related_name="division_submissions",
    )
    division = models.ForeignKey(
        Division,
        on_delete=models.RESTRICT,
        related_name="submissions",
        db_column="division_key",
    )
    reference_no = models.CharField(max_length=80, null=True, blank=True)
    received_from = models.CharField(max_length=255, null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=60, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="division_submissions",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_division_submission"
        constraints = [
            models.UniqueConstraint(
                fields=["workflow_record", "division"],
                name="my_app_division_submission_unique_record_division",
            ),
        ]
        indexes = [
            models.Index(fields=["division", "status"]),
        ]

    def __str__(self):
        return f"{self.workflow_record_id} - {self.division_id}"


class PlanningRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_record = models.OneToOneField(
        WorkflowRecord,
        on_delete=models.CASCADE,
        related_name="planning_record",
    )
    budget_no = models.CharField(max_length=80, null=True, blank=True)
    project_name = models.CharField(max_length=255, null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    contractor = models.CharField(max_length=255, null=True, blank=True)
    contract_amount = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    revised_contract_amount = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    budget_allocation = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=60, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    date_received = models.DateTimeField(null=True, blank=True)
    received_from = models.CharField(max_length=255, null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_planning_record"
        indexes = [
            models.Index(fields=["status", "date_received"]),
        ]

    def __str__(self):
        return self.project_name or str(self.workflow_record_id)


class ConstructionProject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_record = models.OneToOneField(
        WorkflowRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="construction_project",
    )
    project_name = models.CharField(max_length=255)
    location = models.TextField(null=True, blank=True)
    municipality = models.CharField(max_length=120, null=True, blank=True)
    contractor = models.CharField(max_length=255, null=True, blank=True)
    contract_cost = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    ntp_date = models.DateField(null=True, blank=True)
    contract_duration_days = models.PositiveIntegerField(null=True, blank=True)
    original_expiry_date = models.DateField(null=True, blank=True)
    additional_cd_days = models.PositiveIntegerField(null=True, blank=True)
    revised_expiry_date = models.DateField(null=True, blank=True)
    date_completed = models.DateField(null=True, blank=True)
    revised_contract_cost = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    status_previous_percent = models.FloatField(null=True, blank=True)
    status_current_percent = models.FloatField(null=True, blank=True)
    time_elapsed_percent = models.FloatField(null=True, blank=True)
    slippage_percent = models.FloatField(null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="construction_projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_construction_project"
        indexes = [
            models.Index(fields=["status_current_percent", "updated_at"]),
        ]

    def __str__(self):
        return self.project_name


class ConstructionTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    construction_project = models.ForeignKey(
        ConstructionProject,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="tasks",
    )
    workflow_record = models.ForeignKey(
        WorkflowRecord,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="construction_tasks",
    )
    task_name = models.CharField(max_length=255)
    assigned_to = models.CharField(max_length=255, null=True, blank=True)
    date_received = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=60, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_construction_task"
        indexes = [
            models.Index(fields=["status", "date_received"]),
        ]

    def __str__(self):
        return self.task_name


class QualityRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_record = models.OneToOneField(
        WorkflowRecord,
        on_delete=models.CASCADE,
        related_name="quality_record",
    )
    received_from = models.CharField(max_length=255, null=True, blank=True)
    doc_date = models.DateField(null=True, blank=True)
    particulars = models.TextField(null=True, blank=True)
    doc_no = models.CharField(max_length=100, null=True, blank=True)
    billing_type = models.CharField(max_length=120, null=True, blank=True)
    project_location = models.CharField(max_length=255, null=True, blank=True)
    location_detail = models.TextField(null=True, blank=True)
    scan_url = models.TextField(null=True, blank=True)
    route_to_division = models.ForeignKey(
        Division,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        db_column="route_to_division_key",
        related_name="quality_routes",
    )
    received_by = models.CharField(max_length=255, null=True, blank=True)
    date_recv = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=60, null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_quality_record"
        indexes = [
            models.Index(fields=["status", "date_recv"]),
        ]

    def __str__(self):
        return self.doc_no or str(self.workflow_record_id)


class MaintenanceRoad(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    road_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    road_name = models.CharField(max_length=255)
    municipality = models.CharField(max_length=120, null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    surface_type = models.CharField(max_length=80, null=True, blank=True)
    length_km = models.FloatField(null=True, blank=True)
    condition = models.CharField(max_length=60, null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_maintenance_road"
        indexes = [
            models.Index(fields=["condition"]),
        ]

    def __str__(self):
        return self.road_name


class MaintenanceEquipment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=60, null=True, blank=True, unique=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=120, null=True, blank=True)
    model = models.CharField(max_length=120, null=True, blank=True)
    plate_number = models.CharField(max_length=60, null=True, blank=True)
    status = models.CharField(max_length=60, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    operator = models.CharField(max_length=255, null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_maintenance_equipment"
        indexes = [
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return self.name


class MaintenanceSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    road_ref = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=120, null=True, blank=True)
    priority = models.CharField(max_length=60, null=True, blank=True)
    status = models.CharField(max_length=60, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    team = models.CharField(max_length=255, null=True, blank=True)
    estimated_cost = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_maintenance_schedule"
        indexes = [
            models.Index(fields=["status", "start_date"]),
        ]

    def __str__(self):
        return self.title


class MaintenancePersonnel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=80, null=True, blank=True, unique=True)
    division = models.CharField(max_length=120, null=True, blank=True)
    position = models.CharField(max_length=120, null=True, blank=True)
    email = models.CharField(max_length=254, null=True, blank=True)
    phone = models.CharField(max_length=60, null=True, blank=True)
    division_head = models.CharField(max_length=255, null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_maintenance_personnel"

    def __str__(self):
        return self.full_name


class MaintenanceContractor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    trade_name = models.CharField(max_length=255, null=True, blank=True)
    tin = models.CharField(max_length=80, null=True, blank=True, unique=True)
    philgeps = models.CharField(max_length=80, null=True, blank=True)
    pcab = models.CharField(max_length=80, null=True, blank=True)
    status = models.CharField(max_length=60, null=True, blank=True)
    contracts = models.PositiveIntegerField(null=True, blank=True)
    value = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    classification = models.CharField(max_length=120, null=True, blank=True)
    license_expiry = models.DateField(null=True, blank=True)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    contact_email = models.CharField(max_length=254, null=True, blank=True)
    contact_phone = models.CharField(max_length=60, null=True, blank=True)
    contact_address = models.TextField(null=True, blank=True)
    pcab_license = models.CharField(max_length=120, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    contact_city = models.CharField(max_length=120, null=True, blank=True)
    contact_province = models.CharField(max_length=120, null=True, blank=True)
    contact_mobile = models.CharField(max_length=60, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_maintenance_contractor"

    def __str__(self):
        return self.name


class MaintenanceTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_record = models.ForeignKey(
        WorkflowRecord,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="maintenance_tasks",
    )
    admin_record_external_id = models.CharField(max_length=64, null=True, blank=True)
    slip_no = models.CharField(max_length=64, null=True, blank=True)
    title = models.CharField(max_length=255)
    division_label = models.CharField(max_length=120, null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    assigned_to = models.CharField(max_length=255, null=True, blank=True)
    priority = models.CharField(max_length=60, null=True, blank=True)
    status = models.CharField(max_length=60, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    amount = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "my_app_maintenance_task"
        indexes = [
            models.Index(fields=["status", "due_date"]),
        ]

    def __str__(self):
        return self.title
