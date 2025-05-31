from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from projects.models import Project, ProjectType, ProjectStatus
from survey.models import SurveyProject
from document.models import DocumentProject
from supervision.models import SupervisionProject
from execution.models import ExecutionProject

class CreateProjectRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project_type = request.data.get('type')
        title = request.data.get('title')
        description = request.data.get('description', '')

        if project_type not in ['survey', 'documentation', 'supervision', 'execution']:
            return Response({'error': 'نوع پروژه معتبر نیست'}, status=status.HTTP_400_BAD_REQUEST)

        # ایجاد پروژه اصلی با فیلدهای درست
        project = Project.objects.create(
            title=title,
            description=description,
            owner=request.user,
            created_by=request.user,
            project_type=project_type,
            status=ProjectStatus.PENDING,
        )

        # ایجاد زیرپروژه مربوطه بر اساس نوع
        if project_type == 'survey':
            sub = SurveyProject.objects.create(project=project)
        elif project_type == 'documentation':
            sub = DocumentProject.objects.create(project=project)
        elif project_type == 'supervision':
            sub = SupervisionProject.objects.create(project=project)
        elif project_type == 'execution':
            sub = ExecutionProject.objects.create(project=project)

        return Response({
            'message': 'درخواست جدید ثبت شد',
            'project_id': project.id,
            'sub_project_id': sub.id,
            'type': project_type
        }, status=status.HTTP_201_CREATED)
