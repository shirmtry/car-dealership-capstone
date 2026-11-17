"""Seed car makes and models from the course's real inventory fixture."""

import json
from pathlib import Path

from django.conf import settings
from django.db import transaction

from .models import CarMake, CarModel

COUNTRIES = {
    "Audi": "Germany", "BMW": "Germany", "Buick": "United States",
    "Chevrolet": "United States", "Ford": "United States",
    "GMC": "United States", "Honda": "Japan", "Hyundai": "South Korea",
    "Jaguar": "United Kingdom", "Jeep": "United States",
    "Kia": "South Korea", "Lexus": "Japan", "Mazda": "Japan",
    "Mercedes-Benz": "Germany", "Mitsubishi": "Japan",
    "Nissan": "Japan", "Pontiac": "United States", "Porsche": "Germany",
    "Subaru": "Japan", "Tesla": "United States", "Toyota": "Japan",
    "Volkswagen": "Germany", "Volvo": "Sweden",
}


@transaction.atomic
def initiate():
    fixture = Path(settings.BASE_DIR) / "database" / "data" / "car_records.json"
    cars = json.loads(fixture.read_text(encoding="utf-8"))["cars"]
    valid_types = {value for value, label in CarModel.CAR_TYPES}
    for car in cars:
        make, _ = CarMake.objects.get_or_create(
            name=car["make"],
            defaults={
                "description": car["make"] + " vehicles available at our dealers.",
                "country": COUNTRIES.get(car["make"], "United States"),
            },
        )
        car_type = car["bodyType"].upper()
        if car_type not in valid_types:
            car_type = CarModel.SUV
        CarModel.objects.get_or_create(
            car_make=make, name=car["model"],
            defaults={"type": car_type, "year": car["year"]},
        )
    return CarMake.objects.count(), CarModel.objects.count()
