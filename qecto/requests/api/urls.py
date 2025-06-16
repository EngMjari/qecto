from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRequestsViewSet, ContentTypeListView

router = DefaultRouter()
router.register(r'user', UserRequestsViewSet, basename='user-requests')

urlpatterns = [
    path('', include(router.urls)),
    path('contenttypes/', ContentTypeListView.as_view(), name='contenttype-list'),
]
