from django.urls import path
from .views import ExpertProjectRequestAPIView, ExpertAttachmentPreviewView

urlpatterns = [
    path('request/', ExpertProjectRequestAPIView.as_view(), name='expert-request'),
    path('attachments/<int:pk>/preview/',
         ExpertAttachmentPreviewView.as_view(), name='expert-attachment-preview'),
]
