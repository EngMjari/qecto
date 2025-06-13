from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from supervision.models import SupervisionRequest
from .serializers import SupervisionRequestCreateSerializer, SupervisionRequestSerializer
from rest_framework.response import Response
from django.db import transaction


class SupervisionRequestViewSet(viewsets.ModelViewSet):
    queryset = SupervisionRequest.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # اضافه شده برای فایل‌ها

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SupervisionRequestCreateSerializer
        return SupervisionRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return SupervisionRequest.objects.all()
        elif user.is_staff:
            return SupervisionRequest.objects.filter(assigned_admin=user)
        return SupervisionRequest.objects.filter(owner=user)

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                serializer.save()
        except Exception as e:
            print(f"Error in perform_create: {str(e)}")
            raise
