from pathlib import Path

from django.conf import settings
from django.db import connection
from django.db.utils import DatabaseError
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET
import requests


@require_GET
def frontend(request):
    build = Path(settings.BASE_DIR) / 'frontend' / 'build' / 'index.html'
    return render(request, 'index.html' if build.exists() else 'Home.html')


@require_GET
def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        services = {}
        for name, url in [('backend', settings.BACKEND_URL),
                          ('sentiment', settings.SENTIMENT_URL)]:
            response = requests.get(url + '/health', timeout=3)
            response.raise_for_status()
            services[name] = response.json()
        return JsonResponse({'status': 'ok', 'services': services})
    except (requests.RequestException, ValueError, DatabaseError):
        return JsonResponse({'status': 'unavailable'}, status=503)
