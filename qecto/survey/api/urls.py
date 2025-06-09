from django.urls import path
from .views import SurveyProjectRequestAPIView, SurveyAttachmentPreviewView

urlpatterns = [
    path('request/', SurveyProjectRequestAPIView.as_view(), name='survey-request'),
    path('attachments/<int:pk>/preview/',
         SurveyAttachmentPreviewView.as_view(), name='survey-attachment-preview'),
]
