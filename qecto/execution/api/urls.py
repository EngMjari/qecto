# execution/api/urls.py
from rest_framework.routers import DefaultRouter
from .views import ExecutionRequestViewSet

router = DefaultRouter()
router.register(r'requests', ExecutionRequestViewSet,
                basename='execution-request')

urlpatterns = router.urls
