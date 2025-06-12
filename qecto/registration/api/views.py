# qecto/registration/api/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from registration.models import RegistrationRequest
from .serializers import RegistrationRequestCreateSerializer
from projects.models import Project
from survey.models import SurveyRequest


class RegistrationRequestViewSet(viewsets.ModelViewSet):
    queryset = RegistrationRequest.objects.all()
    serializer_class = RegistrationRequestCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            validated_data = serializer.validated_data
            print("Validated data:", validated_data)  # لاگ

            project = validated_data.get('project')
            project_name = validated_data.get('project_name')

            if project_name and not project:
                project = Project.objects.create(
                    title=project_name,
                    owner=self.request.user,
                    created_by=self.request.user
                )
                validated_data['project'] = project
                validated_data.pop('project_name', None)

            registration_request = serializer.save()
            print("Registration request created:", registration_request.id)

            if validated_data.get('request_survey'):
                survey_request = SurveyRequest.objects.create(
                    project=project,
                    area=validated_data.get('area'),
                    building_area=validated_data.get('building_area'),
                    location_lat=validated_data.get('location_lat'),
                    location_lng=validated_data.get('location_lng'),
                    description=validated_data.get('description', ''),
                    status='pending'
                )
                print("Survey request created:", survey_request.id)
        except Exception as e:
            print("Error in perform_create:", str(e))
            raise
