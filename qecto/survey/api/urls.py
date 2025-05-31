from django.urls import path
from .views import SurveyProjectRequestAPIView

urlpatterns = [
    path('request/', SurveyProjectRequestAPIView.as_view(), name='survey-request'),
]