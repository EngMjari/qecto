from django.urls import path
from .views import SiteConfigAPIView, HomePageAPIView, AboutUsAPIView, ContactUsAPIView

urlpatterns = [
    path('config/', SiteConfigAPIView.as_view(), name='site-config'),
    path('homepage/', HomePageAPIView.as_view(), name='homepage-api'),
    path('aboutus/', AboutUsAPIView.as_view(), name='aboutus-api'),
    path('contactus/', ContactUsAPIView.as_view(), name='contactus-api'),
]
