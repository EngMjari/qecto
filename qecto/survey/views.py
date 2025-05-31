from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from projects.models import Project, ProjectType, ProjectStatus
from survay.models import SurveyProject, SurveyAttachment
from core.models import User

class SurveyRequestCreateAPIView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # داده‌های دریافتی فرضی
        title = request.data.get('title')
        description = request.data.get('description', '')
        area = request.data.get('area')
        location_lat = request.data.get('location_lat')
        location_lng = request.data.get('location_lng')
        attachments = request.FILES.getlist('attachments')

        if not title or not area or not location_lat or not location_lng:
            return Response({"detail": "اطلاعات ناقص است"}, status=status.HTTP_400_BAD_REQUEST)

        # ساخت پروژه اصلی با وضعیت pending و owner = کاربر درخواست‌دهنده
        project = Project.objects.create(
            title=title,
            owner=user,
            created_by=user,
            project_type=ProjectType.SURVEY,
            status=ProjectStatus.PENDING,
            description=description,
        )

        # ساخت زیرمدل نقشه‌برداری
        survey = SurveyProject.objects.create(
            project=project,
            description=description,
            area=area,
            location_lat=location_lat,
            location_lng=location_lng,
        )

        # ذخیره فایل‌ها در هر دو مدل (مثلاً فقط SurveyAttachment)
        for file in attachments:
            SurveyAttachment.objects.create(
                survey_project=survey,
                file=file,
                uploaded_by=user,
            )

        return Response({"detail": "درخواست با موفقیت ثبت شد"}, status=status.HTTP_201_CREATED)
