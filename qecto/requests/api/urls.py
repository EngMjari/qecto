from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRequestsViewSet

router = DefaultRouter()
router.register(r'user', UserRequestsViewSet, basename='user-requests')

urlpatterns = [
    path('', include(router.urls)),
]
