# survey/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SurveyRequestViewSet

router = DefaultRouter()
router.register(r'requests', SurveyRequestViewSet, basename='survey-request')

urlpatterns = [
    path('', include(router.urls)),
]
