from django import forms
from django.core.validators import FileExtensionValidator
from django.utils.text import get_valid_filename

from pathlib import Path

from .models import UserProfile


class AccountSettingsForm(forms.Form):
    first_name = forms.CharField(max_length=150, required=False)
    last_name = forms.CharField(max_length=150, required=False)
    email = forms.EmailField(required=False)
    email_notifications = forms.BooleanField(required=False)
    portal_notifications = forms.BooleanField(required=False)
    appearance_mode = forms.ChoiceField(choices=UserProfile.APPEARANCE_CHOICES)
    profile_picture = forms.ImageField(
        required=False,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])],
    )
    remove_profile_picture = forms.BooleanField(required=False)

    def __init__(self, *args, user, profile, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user
        self.profile = profile
        self.fields['first_name'].initial = user.first_name
        self.fields['last_name'].initial = user.last_name
        self.fields['email'].initial = user.email
        self.fields['email_notifications'].initial = profile.email_notifications
        self.fields['portal_notifications'].initial = profile.portal_notifications
        self.fields['appearance_mode'].initial = profile.appearance_mode

    def clean_email(self):
        return self.cleaned_data['email'].strip().lower()

    def clean_profile_picture(self):
        picture = self.cleaned_data.get('profile_picture')
        if not picture:
            return picture

        if picture.size > 2 * 1024 * 1024:
            raise forms.ValidationError('Profile picture must be 2 MB or smaller.')

        content_type = getattr(picture, 'content_type', '')
        if content_type and not content_type.startswith('image/'):
            raise forms.ValidationError('Only image uploads are allowed.')

        return picture

    def save(self):
        self.user.first_name = self.cleaned_data['first_name'].strip()
        self.user.last_name = self.cleaned_data['last_name'].strip()
        self.user.email = self.cleaned_data['email']
        self.user.save(update_fields=['first_name', 'last_name', 'email'])

        remove_picture = self.cleaned_data.get('remove_profile_picture')
        new_picture = self.cleaned_data.get('profile_picture')

        profile_dir = Path(__file__).resolve().parent / 'static' / 'profile'
        profile_dir.mkdir(parents=True, exist_ok=True)
        legacy_uploads_dir = Path(__file__).resolve().parent / 'static' / 'uploads'

        def remove_static_profile_picture():
            for base_dir in (profile_dir, legacy_uploads_dir):
                if not base_dir.exists():
                    continue
                for candidate in base_dir.glob(f'profile_{self.user.id}.*'):
                    try:
                        candidate.unlink()
                    except OSError:
                        # Ignore filesystem errors so settings save still succeeds.
                        pass

        if remove_picture:
            remove_static_profile_picture()
            if self.profile.profile_picture:
                self.profile.profile_picture.delete(save=False)
                self.profile.profile_picture = None

        if new_picture:
            remove_static_profile_picture()

            original_name = get_valid_filename(getattr(new_picture, 'name', '') or 'profile.png')
            ext = Path(original_name).suffix.lower() or '.png'
            filename = f'profile_{self.user.id}{ext}'
            destination = profile_dir / filename

            with destination.open('wb') as handle:
                for chunk in new_picture.chunks():
                    handle.write(chunk)

            # Keep the media-backed ImageField empty; the UI uses the static upload instead.
            if self.profile.profile_picture:
                self.profile.profile_picture.delete(save=False)
            self.profile.profile_picture = None

        self.profile.email_notifications = self.cleaned_data['email_notifications']
        self.profile.portal_notifications = self.cleaned_data['portal_notifications']
        self.profile.appearance_mode = self.cleaned_data['appearance_mode']
        self.profile.save()
        return self.user, self.profile
