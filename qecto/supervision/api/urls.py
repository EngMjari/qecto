# supervision/api/urls.py
from rest_framework.routers import DefaultRouter
from .views import SupervisionRequestViewSet

router = DefaultRouter()
router.register(r'requests',
                SupervisionRequestViewSet, basename='supervision-request')

urlpatterns = router.urls
