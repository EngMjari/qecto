# expert/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpertEvaluationRequestViewSet

router = DefaultRouter()
router.register(r'requests', ExpertEvaluationRequestViewSet,
                basename='expert-request')

urlpatterns = [
    path('', include(router.urls)),
]
