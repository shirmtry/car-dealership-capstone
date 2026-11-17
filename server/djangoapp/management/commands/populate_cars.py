from django.core.management.base import BaseCommand

from djangoapp.populate import initiate


class Command(BaseCommand):
    help = 'Idempotently seed CarMake and CarModel from the inventory fixture.'

    def handle(self, *args, **options):
        makes, models = initiate()
        self.stdout.write(self.style.SUCCESS(
            f'Car inventory ready: {makes} makes, {models} models'
        ))
