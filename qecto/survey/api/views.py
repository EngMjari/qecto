# survey/api/views.py :
from rest_framework.parsers import MultiPartParser, FormParser
from projects.models import Project, ProjectStatus
from survey.models import SurveyProject
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from survey.models import SurveyAttachment
import json


class SurveyProjectRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # دریافت داده‌ها
        title = request.data.get('title')
        description = request.data.get('description', '')
        area = request.data.get('area')
        property_type = request.data.get('propertyType')
        location_raw = request.data.get('location')

        # بررسی اعتبار عنوان و نوع ملک
        if not title:
            return Response({'error': 'عنوان پروژه الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        if not property_type:
            return Response({'error': 'نوع ملک الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        # بررسی اعتبار مختصات مکانی
        try:
            location = json.loads(location_raw) if location_raw else None
            location_lat = location.get('lat') if location else None
            location_lng = location.get('lng') if location else None
        except json.JSONDecodeError:
            return Response({'error': 'موقعیت جغرافیایی نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        # ایجاد پروژه‌ی اصلی
        project = Project.objects.create(
            title=title,
            description=description,
            owner=request.user,
            created_by=request.user,
            project_type='survey',
            status=ProjectStatus.PENDING,
        )

        # ایجاد پروژه‌ی نقشه‌برداری
        survey_project = SurveyProject.objects.create(
            project=project,
            description=description,
            area=area,
            location_lat=location_lat,
            location_lng=location_lng,
        )

        # ذخیره فایل‌های پیوست (در صورت وجود)
        files = request.FILES.getlist('attachments')
        titles = request.POST.getlist('titles')

        for i, file in enumerate(files):
            attachment_title = titles[i] if i < len(titles) else ""
            SurveyAttachment.objects.create(
                survey_project=survey_project,
                title=attachment_title,
                file=file,
                uploaded_by=request.user
            )

        return Response({
            'message': 'درخواست نقشه‌برداری ثبت شد',
            'project_id': project.id,
            'survey_project_id': survey_project.id,
            'uploaded_files': [f.name for f in files],
        }, status=status.HTTP_201_CREATED)
