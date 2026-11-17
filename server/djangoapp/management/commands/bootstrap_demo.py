import json
import os
from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Create a local throwaway user/root, or an environment-based admin.'

    def add_arguments(self, parser):
        parser.add_argument('--local', action='store_true')

    def handle(self, *args, **options):
        if options['local']:
            path = Path(settings.BASE_DIR).parent / '.local' / 'credentials.json'
            if not path.exists():
                raise CommandError('Private local credentials file is missing.')
            data = json.loads(path.read_text(encoding='utf-8-sig'))
            root, _ = User.objects.get_or_create(username=data['adminUsername'])
            root.is_staff = root.is_superuser = root.is_active = True
            root.email = data['adminEmail']
            root.set_password(data['adminPassword'])
            root.save()
            user, _ = User.objects.get_or_create(username=data['username'])
            user.first_name, user.last_name = data['firstName'], data['lastName']
            user.email = data['email']
            user.set_password(data['password'])
            user.save()
            self.stdout.write('Local throwaway accounts ready: root, '
                              + data['username'])
            return
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', '')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', '')
        if username and password:
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.is_staff = user.is_superuser = True
                user.email = os.getenv('DJANGO_SUPERUSER_EMAIL', '')
                user.set_password(password)
                user.save()
                self.stdout.write('Environment administrator created.')
