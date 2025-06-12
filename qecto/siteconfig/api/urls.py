from django.urls import path
from .views import SiteConfigAPIView

urlpatterns = [
    path('config/', SiteConfigAPIView.as_view(), name='site-config'),
]
