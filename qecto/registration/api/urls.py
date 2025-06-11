# registration/api/urls.py
from rest_framework.routers import DefaultRouter
from .views import RegistrationRequestViewSet

router = DefaultRouter()
router.register(r'requests', RegistrationRequestViewSet,
                basename='registration-request')

urlpatterns = router.urls
