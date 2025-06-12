# expert/api/views.py
from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from expert.models import ExpertEvaluationRequest
from expert.api.serializers import ExpertEvaluationRequestSerializer, ExpertEvaluationRequestCreateSerializer


class ExpertEvaluationRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    queryset = ExpertEvaluationRequest.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExpertEvaluationRequestCreateSerializer
        return ExpertEvaluationRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ExpertEvaluationRequest.objects.all()
        elif user.is_staff:
            return ExpertEvaluationRequest.objects.filter(assigned_admin=user)
        return ExpertEvaluationRequest.objects.filter(project__owner=user)

    def perform_create(self, serializer):
        # اعتبارسنجی مختصات یا پلاک
        validated_data = serializer.validated_data
        location_lat = validated_data.get('location_lat')
        location_lng = validated_data.get('location_lng')
        main_parcel_number = validated_data.get('main_parcel_number')
        sub_parcel_number = validated_data.get('sub_parcel_number')

        has_location = location_lat is not None and location_lng is not None
        has_parcel = main_parcel_number is not None and sub_parcel_number is not None

        if not (has_location or has_parcel):
            raise ValidationError(
                "باید حداقل یکی از مختصات جغرافیایی یا پلاک‌های ثبتی (اصلی و فرعی) ارائه شود."
            )

        serializer.save()
