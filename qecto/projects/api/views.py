from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from projects.models import Project
from .serializers import ProjectSerializer, ProjectWithRequestsSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectWithRequestsSerializer
        return ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Project.objects.select_related('owner', 'created_by').all()

        if user.is_superuser:
            # سوپرادمین: تمام پروژه‌ها
            return queryset
        elif user.is_staff:
            # ادمین: پروژه‌هایی که درخواست‌هایی با assigned_admin برابر با این ادمین دارند
            return queryset.filter(
                models.Q(survey_request__assigned_admin=user) |
                models.Q(supervision_requests__assigned_admin=user) |
                models.Q(expert_request__assigned_admin=user) |
                models.Q(execution_request__assigned_admin=user) |
                models.Q(registration_request__assigned_admin=user)
            ).distinct()
        else:
            # کاربر عادی: پروژه‌هایی که خودش مالک یا ایجادکننده آن است یا درخواست‌هایی که مالک آن‌هاست
            return queryset.filter(
                models.Q(owner=user) |
                models.Q(created_by=user) |
                models.Q(survey_request__owner=user) |
                models.Q(supervision_requests__owner=user) |
                models.Q(expert_request__owner=user) |
                models.Q(execution_request__owner=user) |
                models.Q(registration_request__owner=user)
            ).distinct()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            # اعمال فیلترها بر اساس درخواست‌ها
            title = request.query_params.get('title')
            request_type = request.query_params.get('request_type')
            status = request.query_params.get('request_status')
            main_parcel_number = request.query_params.get('main_parcel_number')
            sub_parcel_number = request.query_params.get('sub_parcel_number')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            if title:
                queryset = queryset.filter(title__icontains=title)
            if request_type and request_type != 'all':
                queryset = queryset.filter(
                    **{f'{request_type}_request__isnull': False})
                if status and status != 'all':
                    queryset = queryset.filter(
                        **{f'{request_type}_request__status': status})
                if main_parcel_number:
                    queryset = queryset.filter(
                        **{f'{request_type}_request__main_parcel_number__icontains': main_parcel_number})
                if sub_parcel_number:
                    queryset = queryset.filter(
                        **{f'{request_type}_request__sub_parcel_number__icontains': sub_parcel_number})
            elif status and status != 'all':
                queryset = queryset.filter(
                    models.Q(survey_request__status=status) |
                    models.Q(supervision_requests__status=status) |
                    models.Q(expert_request__status=status) |
                    models.Q(execution_request__status=status) |
                    models.Q(registration_request__status=status)
                ).distinct()
            if main_parcel_number and not request_type:
                queryset = queryset.filter(
                    models.Q(survey_request__main_parcel_number__icontains=main_parcel_number) |
                    models.Q(expert_request__main_parcel_number__icontains=main_parcel_number) |
                    models.Q(registration_request__main_parcel_number__icontains=main_parcel_number) |
                    models.Q(
                        execution_request__main_parcel_number__icontains=main_parcel_number)
                ).distinct()
            if sub_parcel_number and not request_type:
                queryset = queryset.filter(
                    models.Q(survey_request__sub_parcel_number__icontains=sub_parcel_number) |
                    models.Q(expert_request__sub_parcel_number__icontains=sub_parcel_number) |
                    models.Q(registration_request__sub_parcel_number__icontains=sub_parcel_number) |
                    models.Q(
                        execution_request__sub_parcel_number__icontains=sub_parcel_number)
                ).distinct()
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)

            serializer = self.get_serializer(queryset, many=True)
            # محاسبه آمار
            stats = {
                'total_projects': queryset.count(),
                'status_counts': {},
                'request_type_counts': {},
            }
            for project in queryset:
                for req in project.all_requests():
                    # تعیین نوع درخواست بر اساس نوع مدل
                    model_name = req.__class__.__name__
                    if model_name == 'SurveyRequest':
                        req_type = 'survey'
                    elif model_name == 'SupervisionRequest':
                        req_type = 'supervision'
                    elif model_name == 'ExpertRequest':
                        req_type = 'expert'
                    elif model_name == 'ExecutionRequest':
                        req_type = 'execution'
                    elif model_name == 'RegistrationRequest':
                        req_type = 'registration'
                    else:
                        req_type = 'unknown'

                    stats['request_type_counts'][req_type] = stats['request_type_counts'].get(
                        req_type, 0) + 1
                    stats['status_counts'][req.status] = stats['status_counts'].get(
                        req.status, 0) + 1

            return Response({
                'results': serializer.data,
                'stats': stats,
                'count': queryset.count(),
                'next': None,  # در صورت نیاز به صفحه‌بندی پیاده‌سازی شود
                'previous': None,
            })
        except Exception as e:
            raise
