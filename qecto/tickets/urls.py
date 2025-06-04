# tickets/urls.py
from django.urls import path
from .views import TicketReplyAttachmentUploadAPIView, CloseTicketAPIView, TicketListCreateAPIView

urlpatterns = [
    path('', TicketListCreateAPIView.as_view(), name='ticket-list-create'),
    path('<int:pk>/close/', CloseTicketAPIView.as_view(), name='close-ticket'),
    path('replies/upload-attachment/',
         TicketReplyAttachmentUploadAPIView.as_view(), name='upload-ticket-reply-attachment'),

]
