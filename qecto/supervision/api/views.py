from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from supervision.models import SupervisionRequest
from .serializers import SupervisionRequestCreateSerializer, SupervisionRequestSerializer
from rest_framework.response import Response
from django.db import transaction


class SupervisionRequestViewSet(viewsets.ModelViewSet):
    queryset = SupervisionRequest.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return SupervisionRequestCreateSerializer
        return SupervisionRequestSerializer

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                serializer.save()
        except Exception as e:
            print(f"Error in perform_create: {str(e)}")
            raise
