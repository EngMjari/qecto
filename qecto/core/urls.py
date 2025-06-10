# core/urls.py :
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SendOTPView, VerifyOTPView, AdminUserViewSet, UserInfoView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from projects.api.views import UserDashboardAPIView, RequestDetailAPIView, AllRequestsView
router = DefaultRouter()
router.register(r'admin-users', AdminUserViewSet, basename='admin-user')


urlpatterns = [
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('user-info/', UserInfoView.as_view(), name='user-info'),
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('survey/', include('survey.api.urls')),
    path('expert/', include('expert.api.urls')),
    path('projects/', include('projects.api.urls')),
    path('tickets/', include('tickets.urls')),
    path('data/', UserDashboardAPIView.as_view(), name='data'),
    path('requests/<uuid:pk>/',
         RequestDetailAPIView.as_view(), name='request-detail'),
    path('requests/', AllRequestsView.as_view(), name='all-requests'),
    path("site/", include("siteconfig.urls")),


]
