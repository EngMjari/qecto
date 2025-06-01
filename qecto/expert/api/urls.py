from django.urls import path
from .views import ExpertProjectRequestAPIView

urlpatterns = [
    path('request/', ExpertProjectRequestAPIView.as_view(), name='expert-request'),
]
