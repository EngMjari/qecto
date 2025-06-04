from rest_framework import generics, permissions, status, filters
from .models import Ticket
from .serializers import TicketSerializer, TicketReplySerializer, TicketReplyAttachmentSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser


class TicketListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description',
                     'related_project__title', 'created_by__phone_number']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all() if user.is_superuser else (
            Ticket.objects.filter(assigned_admin=user) if user.is_staff else
            Ticket.objects.filter(created_by=user)
        )

        # فیلتر بر اساس status (open, answered, closed)
        status = self.request.query_params.get('status')
        if status in ['open', 'answered', 'closed']:
            queryset = queryset.filter(status=status)

        return queryset


class TicketReplyCreateAPIView(generics.CreateAPIView):
    serializer_class = TicketReplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(replied_by=self.request.user)


class TicketReplyAttachmentUploadAPIView(generics.CreateAPIView):
    serializer_class = TicketReplyAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class CloseTicketAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
            if ticket.status == 'closed':
                return Response({'detail': 'تیکت قبلاً بسته شده است.'}, status=status.HTTP_400_BAD_REQUEST)

            ticket.status = 'closed'
            ticket.save()
            return Response({'detail': 'تیکت با موفقیت بسته شد.'}, status=status.HTTP_200_OK)
        except Ticket.DoesNotExist:
            return Response({'detail': 'تیکت پیدا نشد.'}, status=status.HTTP_404_NOT_FOUND)
