from django.urls import path
from .views import (
    TicketSessionListCreateAPIView,
    TicketSessionRetrieveAPIView,
    TicketMessageCreateAPIView,
)

urlpatterns = [
    path('', TicketSessionListCreateAPIView.as_view(),
         name='ticket-list-create'),
    path('<int:pk>/', TicketSessionRetrieveAPIView.as_view(),
         name='ticket-detail'),
    path('<int:session_id>/messages/',
         TicketMessageCreateAPIView.as_view(), name='ticket-message-create'),
]
