#  core/urls.py :
from django.urls import path, include
from .views import SendOTPView, VerifyOTPView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserInfoAPIView, AdminUserListView

urlpatterns = [
    # Auth و OTP
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # مسیرهای اپ‌های جداگانه
    path('projects/', include('projects.api.urls')),
    # کل درخواست ها
    path('requests/', include('requests.api.urls')),
    # درخواست ها
    path('survey/', include('survey.api.urls')),
    path('expert/', include('expert.api.urls')),
    path('execution/', include('execution.api.urls')),
    path('supervision/', include('supervision.api.urls')),
    path('registration/', include('registration.api.urls')),
    # تیکت ها
    path('tickets/', include('tickets.api.urls')),
    # تنظیمات سایت
    path('site/', include('siteconfig.api.urls')),
    # مشخصات User :
    path("user-info/", UserInfoAPIView.as_view(), name="user-info"),
    # فایل ها
    path('attachments/', include('attachments.api.urls')),
    # سیستم ارجاع
    path('referrals/', include('referrals.api.urls')),
    path('admin-users/', AdminUserListView.as_view(), name='admin-user-list'),
]
