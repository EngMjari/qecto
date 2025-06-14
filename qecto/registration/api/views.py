# qecto/registration/api/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from registration.models import RegistrationRequest
from .serializers import RegistrationRequestCreateSerializer
from projects.models import Project
from survey.models import SurveyRequest
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


class RegistrationRequestViewSet(viewsets.ModelViewSet):
    queryset = RegistrationRequest.objects.all()
    serializer_class = RegistrationRequestCreateSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        try:
            validated_data = serializer.validated_data
            logger.info("Validated data in view: %s", validated_data)

            project = validated_data.get('project')
            project_name = validated_data.get('project_name')

            if project_name and not project:
                logger.info(
                    "Creating new project with title: %s", project_name)
                project = Project.objects.create(
                    title=project_name,
                    owner=self.request.user,
                    created_by=self.request.user
                )
                validated_data['project'] = project
                validated_data.pop('project_name', None)

            registration_request = serializer.save()
            logger.info("Registration request created: %s",
                        registration_request.id)

            if validated_data.get('request_survey'):
                existing_survey = SurveyRequest.objects.filter(
                    project=project).exists()
                if not existing_survey:
                    survey_request = SurveyRequest.objects.create(
                        project=project,
                        owner=self.request.user,
                        area=validated_data.get('area'),
                        building_area=validated_data.get('building_area'),
                        location_lat=validated_data.get('location_lat'),
                        location_lng=validated_data.get('location_lng'),
                        description=validated_data.get('description', ''),
                        status='pending',
                        property_type=validated_data.get(
                            'property_type', 'field'),
                        main_parcel_number=validated_data.get(
                            'main_parcel_number'),
                        sub_parcel_number=validated_data.get(
                            'sub_parcel_number')
                    )
                    logger.info("Survey request created: %s",
                                survey_request.id)
                else:
                    logger.info(
                        "Survey request already exists for project: %s", project.id)

        except Exception as e:
            logger.error("Error in perform_create: %s", str(e))
            raise
