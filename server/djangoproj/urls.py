from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('djangoapp/', include('djangoapp.urls')),
    path('health', views.health, name='health'),
    path('about', TemplateView.as_view(template_name='About.html'), name='about'),
    path('contact', TemplateView.as_view(template_name='Contact.html'),
         name='contact'),
    path('', views.frontend, name='home'),
    re_path(r'^(?:login|register|dealers|dealer/\d+|postreview/\d+)/?$',
            views.frontend, name='frontend'),
]
