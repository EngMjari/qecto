# projects/api/views.py :
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from projects.models import Project, ProjectStatus
from survey.models import SurveyProject
from document.models import DocumentProject
from supervision.models import SupervisionProject
from expert.models import ExpertEvaluationProject
from rest_framework.pagination import PageNumberPagination
from projects.api.serializers import ProjectDetailSerializer, CreateProjectSerializer
from rest_framework.generics import ListAPIView
from django.db import transaction


class CreateProjectRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateProjectSerializer(data=request.data)
        if serializer.is_valid():
            project_type = serializer.validated_data['project_type']
            title = serializer.validated_data['title']
            description = serializer.validated_data.get('description', '')

            try:
                with transaction.atomic():
                    project = Project.objects.create(
                        title=title,
                        description=description,
                        owner=request.user,
                        created_by=request.user,
                        project_type=project_type,
                        status=ProjectStatus.PENDING,
                    )

                    if project_type == 'survey':
                        sub = SurveyProject.objects.create(project=project)
                    elif project_type == 'documentation':
                        sub = DocumentProject.objects.create(project=project)
                    elif project_type == 'supervision':
                        sub = SupervisionProject.objects.create(project=project)
                    elif project_type == 'expert':
                        sub = ExpertEvaluationProject.objects.create(project=project)

                return Response({
                    'message': 'درخواست جدید با موفقیت ثبت شد.',
                    'project_id': project.id,
                    'sub_project_id': sub.id,
                    'type': project_type
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({'error': 'خطا در ایجاد پروژه: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectPagination(PageNumberPagination):
    page_size = 5


class PaginatedProjectDetailsAPIView(ListAPIView):
    serializer_class = ProjectDetailSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ProjectPagination

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(owner=user).order_by('-id')


class ProjectDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            project = Project.objects.get(id=pk, owner=request.user)
        except Project.DoesNotExist:
            return Response({'error': 'پروژه یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        types = []
        if SurveyProject.objects.filter(project=project).exists():
            types.append('survey')
        if ExpertEvaluationProject.objects.filter(project=project).exists():
            types.append('expert')
        if DocumentProject.objects.filter(project=project).exists():
            types.append('documentation')
        if SupervisionProject.objects.filter(project=project).exists():
            types.append('supervision')

        data = {
            'id': project.id,
            'title': project.title,
            'description': project.description,
            'status': project.status,
            'created_at': project.created_at,
            'types': types
        }

        return Response(data, status=status.HTTP_200_OK)
