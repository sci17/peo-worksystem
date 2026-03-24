# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)
    name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()
    first_name = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    action_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class MyAppConstructionProject(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    project_name = models.CharField(max_length=255)
    location = models.TextField(blank=True, null=True)
    municipality = models.CharField(max_length=120, blank=True, null=True)
    contractor = models.CharField(max_length=255, blank=True, null=True)
    contract_cost = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    ntp_date = models.DateField(blank=True, null=True)
    contract_duration_days = models.PositiveIntegerField(blank=True, null=True)
    original_expiry_date = models.DateField(blank=True, null=True)
    additional_cd_days = models.PositiveIntegerField(blank=True, null=True)
    revised_expiry_date = models.DateField(blank=True, null=True)
    date_completed = models.DateField(blank=True, null=True)
    revised_contract_cost = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    status_previous_percent = models.FloatField(blank=True, null=True)
    status_current_percent = models.FloatField(blank=True, null=True)
    time_elapsed_percent = models.FloatField(blank=True, null=True)
    slippage_percent = models.FloatField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    created_by = models.ForeignKey(AuthUser, models.DO_NOTHING, blank=True, null=True)
    workflow_record = models.OneToOneField('MyAppWorkflowRecord', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'my_app_construction_project'


class MyAppConstructionTask(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    task_name = models.CharField(max_length=255)
    assigned_to = models.CharField(max_length=255, blank=True, null=True)
    date_received = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=60, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    construction_project = models.ForeignKey(MyAppConstructionProject, models.DO_NOTHING, blank=True, null=True)
    workflow_record = models.ForeignKey('MyAppWorkflowRecord', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'my_app_construction_task'


class MyAppConstructionupload(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    stored_name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    url = models.CharField(max_length=500)
    content_type = models.CharField(max_length=100)
    size_bytes = models.PositiveIntegerField()
    created_at = models.DateTimeField()
    uploaded_by = models.ForeignKey(AuthUser, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'my_app_constructionupload'


class MyAppDivision(models.Model):
    key = models.CharField(primary_key=True, max_length=20)
    label = models.CharField(unique=True, max_length=120)
    is_active = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'my_app_division'


class MyAppDivisionSubmission(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    reference_no = models.CharField(max_length=80, blank=True, null=True)
    received_from = models.CharField(max_length=255, blank=True, null=True)
    received_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=60, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    division_key = models.ForeignKey(MyAppDivision, models.DO_NOTHING, db_column='division_key')
    submitted_by = models.ForeignKey(AuthUser, models.DO_NOTHING, blank=True, null=True)
    workflow_record = models.ForeignKey('MyAppWorkflowRecord', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'my_app_division_submission'
        unique_together = (('workflow_record', 'division_key'),)


class MyAppDivisionstore(models.Model):
    key = models.CharField(max_length=20)
    data = models.JSONField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'my_app_divisionstore'
        unique_together = (('user', 'key'),)


class MyAppDivisionstoreevent(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    store_key = models.CharField(max_length=20)
    target = models.CharField(max_length=10)
    write_mode = models.CharField(max_length=50)
    request_payload = models.JSONField(blank=True, null=True)
    stored_payload = models.JSONField(blank=True, null=True)
    path = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    created_at = models.DateTimeField()
    actor = models.ForeignKey(AuthUser, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'my_app_divisionstoreevent'


class MyAppMaintenanceContractor(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    name = models.CharField(max_length=255)
    trade_name = models.CharField(max_length=255, blank=True, null=True)
    tin = models.CharField(unique=True, max_length=80, blank=True, null=True)
    philgeps = models.CharField(max_length=80, blank=True, null=True)
    pcab = models.CharField(max_length=80, blank=True, null=True)
    status = models.CharField(max_length=60, blank=True, null=True)
    contracts = models.PositiveIntegerField(blank=True, null=True)
    value = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    rating = models.FloatField(blank=True, null=True)
    classification = models.CharField(max_length=120, blank=True, null=True)
    license_expiry = models.DateField(blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.CharField(max_length=254, blank=True, null=True)
    contact_phone = models.CharField(max_length=60, blank=True, null=True)
    contact_address = models.TextField(blank=True, null=True)
    pcab_license = models.CharField(max_length=120, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    contact_city = models.CharField(max_length=120, blank=True, null=True)
    contact_province = models.CharField(max_length=120, blank=True, null=True)
    contact_mobile = models.CharField(max_length=60, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'my_app_maintenance_contractor'


class MyAppMaintenanceEquipment(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    code = models.CharField(unique=True, max_length=60, blank=True, null=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=120, blank=True, null=True)
    model = models.CharField(max_length=120, blank=True, null=True)
    plate_number = models.CharField(max_length=60, blank=True, null=True)
    status = models.CharField(max_length=60, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    operator = models.CharField(max_length=255, blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'my_app_maintenance_equipment'


class MyAppMaintenancePersonnel(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    full_name = models.CharField(max_length=255)
    employee_id = models.CharField(unique=True, max_length=80, blank=True, null=True)
    division = models.CharField(max_length=120, blank=True, null=True)
    position = models.CharField(max_length=120, blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    phone = models.CharField(max_length=60, blank=True, null=True)
    division_head = models.CharField(max_length=255, blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'my_app_maintenance_personnel'


class MyAppMaintenanceRoad(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    road_id = models.CharField(unique=True, max_length=100, blank=True, null=True)
    road_name = models.CharField(max_length=255)
    municipality = models.CharField(max_length=120, blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    surface_type = models.CharField(max_length=80, blank=True, null=True)
    length_km = models.FloatField(blank=True, null=True)
    condition = models.CharField(max_length=60, blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'my_app_maintenance_road'


class MyAppMaintenanceSchedule(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    title = models.CharField(max_length=255)
    road_ref = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=120, blank=True, null=True)
    priority = models.CharField(max_length=60, blank=True, null=True)
    status = models.CharField(max_length=60, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    team = models.CharField(max_length=255, blank=True, null=True)
    estimated_cost = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'my_app_maintenance_schedule'


class MyAppMaintenanceTask(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    admin_record_external_id = models.CharField(max_length=64, blank=True, null=True)
    slip_no = models.CharField(max_length=64, blank=True, null=True)
    title = models.CharField(max_length=255)
    division_label = models.CharField(max_length=120, blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    assigned_to = models.CharField(max_length=255, blank=True, null=True)
    priority = models.CharField(max_length=60, blank=True, null=True)
    status = models.CharField(max_length=60, blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    amount = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    workflow_record = models.ForeignKey('MyAppWorkflowRecord', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'my_app_maintenance_task'


class MyAppPlanningRecord(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    budget_no = models.CharField(max_length=80, blank=True, null=True)
    project_name = models.CharField(max_length=255, blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    contractor = models.CharField(max_length=255, blank=True, null=True)
    contract_amount = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    revised_contract_amount = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    budget_allocation = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=60, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    date_received = models.DateTimeField(blank=True, null=True)
    received_from = models.CharField(max_length=255, blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    updated_at = models.DateTimeField()
    workflow_record = models.OneToOneField('MyAppWorkflowRecord', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'my_app_planning_record'


class MyAppQualityRecord(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    received_from = models.CharField(max_length=255, blank=True, null=True)
    doc_date = models.DateField(blank=True, null=True)
    particulars = models.TextField(blank=True, null=True)
    doc_no = models.CharField(max_length=100, blank=True, null=True)
    billing_type = models.CharField(max_length=120, blank=True, null=True)
    project_location = models.CharField(max_length=255, blank=True, null=True)
    location_detail = models.TextField(blank=True, null=True)
    scan_url = models.TextField(blank=True, null=True)
    received_by = models.CharField(max_length=255, blank=True, null=True)
    date_recv = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=60, blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    updated_at = models.DateTimeField()
    route_to_division_key = models.ForeignKey(MyAppDivision, models.DO_NOTHING, db_column='route_to_division_key', blank=True, null=True)
    workflow_record = models.OneToOneField('MyAppWorkflowRecord', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'my_app_quality_record'


class MyAppShareddivisionstore(models.Model):
    key = models.CharField(unique=True, max_length=20)
    data = models.JSONField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'my_app_shareddivisionstore'


class MyAppUserprofile(models.Model):
    profile_picture = models.CharField(max_length=100)
    updated_at = models.DateTimeField()
    user = models.OneToOneField(AuthUser, models.DO_NOTHING)
    appearance_mode = models.CharField(max_length=10)
    email_notifications = models.IntegerField()
    portal_notifications = models.IntegerField()
    division = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'my_app_userprofile'


class MyAppWorkflowEvent(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    action = models.CharField(max_length=80)
    status_after = models.CharField(max_length=50, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    acted_at = models.DateTimeField()
    acted_by = models.ForeignKey(AuthUser, models.DO_NOTHING, blank=True, null=True)
    from_division_key = models.ForeignKey(MyAppDivision, models.DO_NOTHING, db_column='from_division_key', blank=True, null=True)
    to_division_key = models.ForeignKey(MyAppDivision, models.DO_NOTHING, db_column='to_division_key', related_name='myappworkflowevent_to_division_key_set', blank=True, null=True)
    workflow_record = models.ForeignKey('MyAppWorkflowRecord', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'my_app_workflow_event'


class MyAppWorkflowRecord(models.Model):
    id = models.CharField(primary_key=True, max_length=32)
    source_admin_record_id = models.CharField(unique=True, max_length=64, blank=True, null=True)
    slip_no = models.CharField(max_length=64, blank=True, null=True)
    document_name = models.CharField(max_length=255)
    project_name = models.CharField(max_length=255, blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    contractor = models.CharField(max_length=255, blank=True, null=True)
    billing_type = models.CharField(max_length=120, blank=True, null=True)
    contract_amount = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    revised_contract_amount = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    doc_status = models.CharField(max_length=50)
    billing_status = models.CharField(max_length=50)
    scanned_file_url = models.TextField(blank=True, null=True)
    date_received = models.DateTimeField(blank=True, null=True)
    payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    assigned_division_key = models.ForeignKey(MyAppDivision, models.DO_NOTHING, db_column='assigned_division_key')
    created_by = models.ForeignKey(AuthUser, models.DO_NOTHING, blank=True, null=True)
    submitted_from_division_key = models.ForeignKey(MyAppDivision, models.DO_NOTHING, db_column='submitted_from_division_key', related_name='myappworkflowrecord_submitted_from_division_key_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'my_app_workflow_record'
