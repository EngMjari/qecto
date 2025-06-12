# execution/api/views.py
from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from execution.models import ExecutionRequest
from execution.api.serializers import ExecutionRequestSerializer, ExecutionRequestCreateSerializer


class ExecutionRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    queryset = ExecutionRequest.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExecutionRequestCreateSerializer
        return ExecutionRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ExecutionRequest.objects.all()
        elif user.is_staff:
            return ExecutionRequest.objects.filter(assigned_admin=user)
        return ExecutionRequest.objects.filter(project__owner=user)

    def perform_create(self, serializer):
        serializer.save()
