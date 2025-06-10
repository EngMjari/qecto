# siteconfig/urls.py
from django.urls import path
from .api import SiteConfigAPIView

urlpatterns = [
    path('config/', SiteConfigAPIView.as_view(), name='site-config'),
]
