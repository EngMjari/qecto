from django.urls import path
from .views import (
    TicketSessionListCreateView, TicketSessionDetailView,
    TicketSessionCloseView, TicketSessionsByRequestView,
    TicketMessageAttachmentView, TicketSessionReopenView,
    PublicTicketCreateView
)

urlpatterns = [
    path('sessions/', TicketSessionListCreateView.as_view(),
         name='tickets-session-list-create'),
    path('sessions/<uuid:session_id>/', TicketSessionDetailView.as_view(),
         name='tickets-session-detail'),
    path('sessions/<uuid:session_id>/close/',
         TicketSessionCloseView.as_view(), name='tickets-session-close'),
    path('sessions/by-request/<uuid:request_id>/<str:request_type>/',
         TicketSessionsByRequestView.as_view(), name='tickets-sessions-by-request'),
    path('messages/<uuid:ticket_id>/<uuid:message_id>/attachments/',
         TicketMessageAttachmentView.as_view(), name='tickets-message-attachment'),
    path('sessions/<uuid:session_id>/reopen/',
         TicketSessionReopenView.as_view(), name='ticket-session-reopen'),
    path('public-ticket/', PublicTicketCreateView.as_view(),
         name='public-ticket-create'),
]
