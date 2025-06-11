from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SendOTPView, VerifyOTPView, AdminUserViewSet, UserInfoView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# روتری که فقط viewset های ساده core رو ثبت می‌کند
router = DefaultRouter()
router.register(r'admin-users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    # Auth و OTP
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # کاربر لاگین شده
    path('user-info/', UserInfoView.as_view(), name='user-info'),

    # viewset های core (admin-users)
    path('', include(router.urls)),

    # مسیرهای اپ‌های جداگانه
    path('projects/', include('projects.api.urls')),
    # درخواست ها
    path('survey/', include('survey.api.urls')),
    path('expert/', include('expert.api.urls')),
    path('execution/', include('execution.api.urls')),
    path('supervision/', include('supervision.api.urls')),
    path('registration/', include('registration.api.urls')),
    # تیکت ها
    path('tickets/', include('tickets.urls')),
    # تنظیمات سایت
    path('site/', include('siteconfig.urls')),

    # مسیرهای خاص
    # path('data/', UserDashboardAPIView.as_view(), name='user-dashboard'),
    # path('requests/<uuid:pk>/', RequestDetailAPIView.as_view(), name='request-detail'),
    # path('requests/', AllRequestsView.as_view(), name='all-requests'),
]
