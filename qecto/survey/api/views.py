# survey/api/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from projects.models import Project
from survey.models import SurveyRequest
from survey.api.serializers import SurveyRequestSerializer


class SurveyRequestViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def list(self, request):
        user = request.user
        # فقط درخواست‌های خود کاربر را می‌گیریم
        queryset = SurveyRequest.objects.filter(project__owner=user)
        serializer = SurveyRequestSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        user = request.user
        # فقط اجازه می‌دهیم درخواست‌های پروژه‌های متعلق به خود کاربر خوانده شود
        survey_request = get_object_or_404(
            SurveyRequest, pk=pk, project__owner=user)
        serializer = SurveyRequestSerializer(survey_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):
        user = request.user
        data = request.data

        project_id = data.get("project")
        project_name = data.get("project_name")

        location = data.get("location")
        if not location:
            return Response({"detail": "location is required."}, status=status.HTTP_400_BAD_REQUEST)

        property_type = data.get("property_type")
        if not property_type:
            return Response({"detail": "property_type is required."}, status=status.HTTP_400_BAD_REQUEST)

        area = data.get("area")
        description = data.get("description")
        building_area = data.get("building_area")
        main_parcel_number = data.get("main_parcel_number")
        sub_parcel_number = data.get("sub_parcel_number")
        status_field = data.get("status", "pending")

        # بررسی پروژه انتخاب شده یا ایجاد پروژه جدید
        if project_id:
            try:
                project = Project.objects.get(id=project_id, owner=user)
            except Project.DoesNotExist:
                return Response({"detail": "Project not found or not owned by user."}, status=status.HTTP_404_NOT_FOUND)
        else:
            if not project_name:
                return Response({"detail": "project_name is required when no project selected."}, status=status.HTTP_400_BAD_REQUEST)
            project = Project.objects.create(name=project_name, owner=user)

        # ساخت درخواست نقشه‌برداری
        survey_request = SurveyRequest.objects.create(
            project=project,
            location=location,
            property_type=property_type,
            area=area,
            description=description,
            building_area=building_area,
            main_parcel_number=main_parcel_number,
            sub_parcel_number=sub_parcel_number,
            status=status_field,
            assigned_admin=None,
        )

        # ذخیره فایل‌ها
        files = request.FILES.getlist('files')
        for f in files:
            survey_request.files.create(file=f)

        serializer = SurveyRequestSerializer(survey_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
