# survey/api/views.py
from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from survey.models import SurveyRequest
from survey.api.serializers import SurveyRequestSerializer, SurveyRequestCreateSerializer


class SurveyRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    queryset = SurveyRequest.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SurveyRequestCreateSerializer
        return SurveyRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return SurveyRequest.objects.all()
        elif user.is_staff:
            return SurveyRequest.objects.filter(assigned_admin=user)
        return SurveyRequest.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save()
