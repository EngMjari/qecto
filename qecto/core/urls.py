from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SendOTPView, VerifyOTPView, AdminUserViewSet, UserInfoView

router = DefaultRouter()
router.register(r'admin-users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('api/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('api/', include(router.urls)),
    path('api/user-info/', UserInfoView.as_view(), name='user-info'),
]
