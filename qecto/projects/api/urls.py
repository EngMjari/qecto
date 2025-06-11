from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectsViewSet

router = DefaultRouter()
router.register(r'', ProjectsViewSet, basename='projects')

urlpatterns = [
    path('', include(router.urls)),
]
