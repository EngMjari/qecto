# projects/api/views.py :
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from projects.models import Project, ProjectStatus
from survey.api.serializers import SurveyProject, SurveyProjectSerializer
from document.models import DocumentProject
from supervision.models import SupervisionProject
from expert.api.serializers import ExpertEvaluationProject, ExpertEvaluationProjectSerializer
from rest_framework.pagination import PageNumberPagination
from projects.api.serializers import ProjectDetailSerializer, CreateProjectSerializer, ProjectDataSerializer
from rest_framework.generics import ListAPIView
from django.db import transaction
from core.serializers import UserSerializer
from django.contrib.auth import get_user_model
from tickets.serializers import Ticket, TicketSerializer
User = get_user_model()


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
                        sub = SupervisionProject.objects.create(
                            project=project)
                    elif project_type == 'expert':
                        sub = ExpertEvaluationProject.objects.create(
                            project=project)

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
    page_size = 8


class PaginatedProjectDetailsAPIView(ListAPIView):
    serializer_class = ProjectDetailSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ProjectPagination

    def get_queryset(self):
        user = self.request.user
        queryset = Project.objects.filter(owner=user).order_by('-id')

        # دریافت پارامترهای فیلتر از query params
        status_param = self.request.query_params.get('status')
        search_param = self.request.query_params.get('search')

        if status_param:
            queryset = queryset.filter(status=status_param)

        if search_param:
            queryset = queryset.filter(title__icontains=search_param)

        return queryset


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


class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        projects = Project.objects.filter(owner=user).order_by('-created_at')

        total_requests = 0
        completed_requests = 0
        recent_requests = []

        for project in projects:
            # Survey
            try:
                survey = SurveyProject.objects.get(project=project)
                total_requests += 1
                if survey.status == 'completed':
                    completed_requests += 1
                recent_requests.append({
                    'type': 'survey',
                    'title': project.title,  # اضافه کردن عنوان پروژه
                    'data': SurveyProjectSerializer(survey).data
                })
            except SurveyProject.DoesNotExist:
                pass

            # Expert
            try:
                expert = ExpertEvaluationProject.objects.get(project=project)
                total_requests += 1
                if expert.status == 'completed':
                    completed_requests += 1
                recent_requests.append({
                    'type': 'expert',
                    'title': project.title,  # اضافه کردن عنوان پروژه
                    'data': ExpertEvaluationProjectSerializer(expert).data
                })
            except ExpertEvaluationProject.DoesNotExist:
                pass

        # فقط 5 درخواست آخر
        recent_requests_sorted = sorted(
            recent_requests,
            key=lambda x: x['data']['created_at'],
            reverse=True
        )[:5]
        currentUser = UserSerializer(user).data
        return Response({
            'total_requests': total_requests,
            'completed_requests': completed_requests,
            'recent_requests': recent_requests_sorted,
            'all_requests': recent_requests,
            'user': currentUser,
            # 'ticket_count': ...  (در آینده اضافه می‌کنی)
            # 'recent_tickets': ...
        })


class UserDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # اطلاعات کامل کاربر
        user_data = UserSerializer(user).data

        # پروژه‌های کاربر به همراه درخواست‌ها
        projects = Project.objects.filter(owner=user)
        projects_data = ProjectDataSerializer(projects, many=True).data

        # درخواست‌های نقشه‌برداری کاربر
        survey_requests = SurveyProject.objects.filter(project__owner=user)

        # درخواست‌های کارشناسی کاربر
        expert_requests = ExpertEvaluationProject.objects.filter(project__owner=user)

        # تعداد کل و تعداد تکمیل شده درخواست‌ها
        total_requests_count = survey_requests.count() + expert_requests.count()
        completed_requests_count = survey_requests.filter(status='completed').count() + \
                                   expert_requests.filter(status='completed').count()

        # ۵ درخواست آخر ترکیبی (نقشه‌برداری + کارشناسی)
        last_5_survey = survey_requests.order_by('-created_at')[:5]
        last_5_expert = expert_requests.order_by('-created_at')[:5]

        # سریالایز جداگانه
        last_5_survey_serialized = SurveyProjectSerializer(last_5_survey, many=True).data
        last_5_expert_serialized = ExpertEvaluationProjectSerializer(last_5_expert, many=True).data

        # ترکیب و مرتب‌سازی بر اساس created_at
        combined_last_5 = last_5_survey_serialized + last_5_expert_serialized
        combined_last_5.sort(key=lambda x: x['created_at'], reverse=True)
        last_5_requests_serialized = combined_last_5[:5]

        # ۵ تیکت آخر کاربر
        last_5_tickets = Ticket.objects.filter(created_by=user).order_by('-created_at')[:5]
        last_5_tickets_serialized = TicketSerializer(last_5_tickets, many=True).data

        data = {
            "user": user_data,
            "projects": projects_data,
            "requests_summary": {
                "total": total_requests_count,
                "completed": completed_requests_count,
            },
            "last_5_requests": last_5_requests_serialized,
            "last_5_tickets": last_5_tickets_serialized,
        }
        return Response(data)