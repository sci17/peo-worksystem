from django.apps import AppConfig


class MyAppConfig(AppConfig):
    name = 'my_app'

    def ready(self):
        from django.contrib.auth.models import Group
        from django.db.models.signals import post_migrate

        canonical_group_names = (
            "Admin Division",
            "Admin Division Staff Engineer",
            "Planning Division",
            "Planning Division Staff Engineer",
            "Construction Division",
            "Construction Division Staff Engineer",
            "Quality Control Division",
            "Quality Division Staff Engineer",
            "Maintenance Division",
            "Maintenance Division Staff Engineer",
        )

        def ensure_division_groups(sender, **kwargs):
            if getattr(sender, "name", "") != self.name:
                return

            for group_name in canonical_group_names:
                Group.objects.get_or_create(name=group_name)

        post_migrate.connect(ensure_division_groups, sender=self, dispatch_uid="my_app.ensure_division_groups")
