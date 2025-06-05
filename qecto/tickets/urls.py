# urls.py
from django.urls import path
from .views import (
    TicketSessionListCreateAPIView,
    TicketSessionRetrieveUpdateAPIView,
    TicketMessageListCreateAPIView,
    TicketMessageFileUploadAPIView,
)

urlpatterns = [
    path('sessions/', TicketSessionListCreateAPIView.as_view(), name='ticket-session-list-create'),
    path('sessions/<int:pk>/', TicketSessionRetrieveUpdateAPIView.as_view(), name='ticket-session-detail'),
    path('sessions/<int:session_id>/messages/', TicketMessageListCreateAPIView.as_view(), name='ticket-message-list-create'),
    path('messages/<int:message_id>/upload/', TicketMessageFileUploadAPIView.as_view(), name='ticket-message-file-upload'),
]
