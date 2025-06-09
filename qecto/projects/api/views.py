# projects/api/views.py :
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
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
from tickets.models import TicketMessage
from tickets.serializers import TicketMessageSerializer
from django.db.models import Q, Max
from django.utils.timezone import localtime


User = get_user_model()


class Pagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page'


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


class PaginatedProjectDetailsAPIView(ListAPIView):
    serializer_class = ProjectDetailSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = Pagination

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

# TODO: check


class UserDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # اطلاعات کاربر
        user_data = UserSerializer(user).data

        # پروژه‌های کاربر
        projects = Project.objects.filter(owner=user)
        projects_data = ProjectDataSerializer(projects, many=True).data

        # همه درخواست‌های کاربر
        survey_requests = SurveyProject.objects.filter(project__owner=user)
        expert_requests = ExpertEvaluationProject.objects.filter(
            project__owner=user)

        # سریال‌سازی همه درخواست‌ها
        all_survey_serialized = SurveyProjectSerializer(
            survey_requests, many=True).data
        all_expert_serialized = ExpertEvaluationProjectSerializer(
            expert_requests, many=True).data
        all_requests = all_survey_serialized + all_expert_serialized

        # ۵ درخواست آخر ترکیبی (براساس created_at)
        latest_survey = list(survey_requests.order_by('-created_at')[:5])
        latest_expert = list(expert_requests.order_by('-created_at')[:5])

        combined_latest_serialized = (
            SurveyProjectSerializer(latest_survey, many=True).data +
            ExpertEvaluationProjectSerializer(latest_expert, many=True).data
        )
        combined_latest_serialized.sort(
            key=lambda x: x['created_at'], reverse=True)
        latest_requests = combined_latest_serialized[:5]

        # ۵ پیام آخر از سشن‌های مختلف
        latest_messages_per_session = (
            TicketMessage.objects
            .filter(Q(sender_user=user))
            .values('session')
            .annotate(latest_id=Max('id'))
            .order_by('-latest_id')[:5]
        )
        latest_ids = [item['latest_id']
                      for item in latest_messages_per_session]
        last_5_messages = TicketMessage.objects.filter(
            id__in=latest_ids).order_by('-created_at')
        latest_messages = TicketMessageSerializer(
            last_5_messages, many=True).data

        # خروجی نهایی
        data = {
            "user": user_data,
            "projects": projects_data,
            "requests": all_requests,
            "latest_requests": latest_requests,
            "latest_messages": latest_messages,
        }

        return Response(data)


class AllRequestsView(APIView):
    permission_classes = [IsAuthenticated]  # فقط کاربران لاگین‌شده

    def get(self, request):
        type_filter = request.GET.get("type")
        title_filter = request.GET.get("title")
        location_filter = request.GET.get("location")
        date_filter = request.GET.get("created_at")
        area_filter = request.GET.get("area")
        main_parcel_number = request.GET.get("main_parcel_number")
        sub_parcel_number = request.GET.get("sub_parcel_number")
        status_filter = request.GET.get("status")
        combined = []

        # Survey Projects
        if type_filter in [None, "", "survey", "نقشه‌برداری"]:
            survey_qs = SurveyProject.objects.filter(
                project__owner=request.user)

            if title_filter:
                survey_qs = survey_qs.filter(
                    project__title__icontains=title_filter)
            if location_filter:
                survey_qs = survey_qs.filter(
                    project__location__icontains=location_filter)
            if date_filter:
                survey_qs = survey_qs.filter(created_at__date=date_filter)
            if area_filter:
                survey_qs = survey_qs.filter(area=area_filter)
            if main_parcel_number:
                survey_qs = survey_qs.filter(
                    main_parcel_number__icontains=main_parcel_number)
            if sub_parcel_number:
                survey_qs = survey_qs.filter(
                    sub_parcel_number__icontains=sub_parcel_number)
            if status_filter and status_filter != "all":
                survey_qs = survey_qs.filter(status=status_filter)

            for obj in survey_qs:
                data = SurveyProjectSerializer(obj).data
                data['created_at'] = localtime(obj.created_at)
                combined.append(data)

        # Expert Requests
        if type_filter in [None, "", "expert", "کارشناسی"]:
            expert_qs = ExpertEvaluationProject.objects.filter(
                project__owner=request.user)

            if title_filter:
                expert_qs = expert_qs.filter(
                    project__title__icontains=title_filter)
            if location_filter:
                expert_qs = expert_qs.filter(
                    project__location__icontains=location_filter)
            if date_filter:
                expert_qs = expert_qs.filter(created_at__date=date_filter)
            if area_filter:
                expert_qs = expert_qs.filter(area=area_filter)
            if main_parcel_number:
                expert_qs = expert_qs.filter(
                    main_parcel_number__icontains=main_parcel_number)

            if sub_parcel_number:
                expert_qs = expert_qs.filter(
                    sub_parcel_number__icontains=sub_parcel_number)

            if status_filter and status_filter != "all":
                expert_qs = expert_qs.filter(status=status_filter)

            for obj in expert_qs:
                data = ExpertEvaluationProjectSerializer(obj).data
                data['created_at'] = localtime(obj.created_at)
                combined.append(data)

        # مرتب‌سازی به ترتیب تاریخ
        combined_sorted = sorted(
            combined, key=lambda x: x['created_at'], reverse=True)
        # اگر هیچ فیلتر یا پارامتر مشخص نشده باشد، همه درخواست‌ها را برمی‌گردانیم
        # صفحه‌بندی
        paginator = Pagination()
        paginated_data = paginator.paginate_queryset(combined_sorted, request)

        return paginator.get_paginated_response(paginated_data)


class AllProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        title_filter = request.GET.get("title")
        main_parcel_number = request.GET.get("main_parcel_number")
        sub_parcel_number = request.GET.get("sub_parcel_number")
        request_type = request.GET.get("request_type")  # survey, expert, ...
        project_status = request.GET.get("status")  # وضعیت پروژه
        request_status = request.GET.get("request_status")  # وضعیت درخواست

        # فیلتر اولیه پروژه‌ها
        projects = Project.objects.filter(owner=user)
        if title_filter:
            projects = projects.filter(title__icontains=title_filter)
        if project_status and project_status != "all":
            projects = projects.filter(status=project_status)

        filtered_projects = []
        for project in projects:
            requests_qs = []

            # بررسی درخواست‌های نقشه‌برداری
            if request_type in [None, "", "all", "survey", "نقشه‌برداری"]:
                survey_qs = SurveyProject.objects.filter(project=project)
                if main_parcel_number:
                    survey_qs = survey_qs.filter(
                        main_parcel_number__icontains=main_parcel_number)
                if sub_parcel_number:
                    survey_qs = survey_qs.filter(
                        sub_parcel_number__icontains=sub_parcel_number)
                if request_status and request_status != "all":
                    survey_qs = survey_qs.filter(status=request_status)
                if survey_qs.exists():
                    requests_qs.extend(list(survey_qs))

            # بررسی درخواست‌های کارشناسی
            if request_type in [None, "", "all", "expert", "کارشناسی"]:
                expert_qs = ExpertEvaluationProject.objects.filter(
                    project=project)
                if main_parcel_number:
                    expert_qs = expert_qs.filter(
                        main_parcel_number__icontains=main_parcel_number)
                if sub_parcel_number:
                    expert_qs = expert_qs.filter(
                        sub_parcel_number__icontains=sub_parcel_number)
                if request_status and request_status != "all":
                    expert_qs = expert_qs.filter(status=request_status)
                if expert_qs.exists():
                    requests_qs.extend(list(expert_qs))

            # اگر نوع درخواست خاصی انتخاب شده فقط همان را نگه دار
            if request_type not in [None, "", "all"]:
                if request_type in ["survey", "نقشه‌برداری"]:
                    requests_qs = [
                        r for r in requests_qs if isinstance(r, SurveyProject)]
                elif request_type in ["expert", "کارشناسی"]:
                    requests_qs = [r for r in requests_qs if isinstance(
                        r, ExpertEvaluationProject)]

            # فقط پروژه‌هایی که حداقل یک درخواست مرتبط دارند
            if requests_qs:
                filtered_projects.append(project)

        # مرتب‌سازی پروژه‌ها بر اساس وضعیت پروژه
        filtered_projects = sorted(filtered_projects, key=lambda p: p.status)

        # صفحه‌بندی پروژه‌های فیلترشده
        paginator = Pagination()
        paginated_projects = paginator.paginate_queryset(
            filtered_projects, request)
        serializer = ProjectDataSerializer(paginated_projects, many=True)
        return paginator.get_paginated_response(serializer.data)


class RequestDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        is_admin = user.is_staff or user.is_superuser

        # ابتدا در SurveyProject جستجو کن
        try:
            survey = SurveyProject.objects.get(id=pk)
            if not is_admin and survey.project.owner != user:
                return Response({'error': 'دسترسی غیرمجاز.'}, status=status.HTTP_404_NOT_FOUND)
            data = SurveyProjectSerializer(survey).data
            data['type'] = 'survey'
            return Response(data, status=status.HTTP_200_OK)
        except SurveyProject.DoesNotExist:
            pass

        # سپس در ExpertEvaluationProject جستجو کن
        try:
            expert = ExpertEvaluationProject.objects.get(id=pk)
            if not is_admin and expert.project.owner != user:
                return Response({'error': 'دسترسی غیرمجاز.'}, status=status.HTTP_404_NOT_FOUND)
            data = ExpertEvaluationProjectSerializer(expert).data
            data['type'] = 'expert'
            return Response(data, status=status.HTTP_200_OK)
        except ExpertEvaluationProject.DoesNotExist:
            pass

        # اگر هیچکدام نبود
        return Response({'error': 'درخواست یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
