from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from projects.models import Project, ProjectStatus
from survey.models import SurveyProject

class SurveyProjectRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get('title')
        description = request.data.get('description', '')

        if not title:
            return Response({'error': 'عنوان پروژه الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        project = Project.objects.create(
            title=title,
            description=description,
            owner=request.user,
            created_by=request.user,
            project_type='survey',
            status=ProjectStatus.PENDING,
        )

        survey_project = SurveyProject.objects.create(
            project=project,
            description=description,
        )

        return Response({
            'message': 'درخواست نقشه‌برداری ثبت شد',
            'project_id': project.id,
            'survey_project_id': survey_project.id,
        }, status=status.HTTP_201_CREATED)
