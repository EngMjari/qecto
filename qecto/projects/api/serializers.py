# projects/api/serializers.py
from rest_framework import serializers
from projects.models import Project, ProjectType, ProjectStatus
from survay.models import SurveyProject, SurveyAttachment
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'project_type', 'status', 'created_at']

class SurveyAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyAttachment
        fields = ['id', 'file', 'uploaded_at']

class SurveyProjectSerializer(serializers.ModelSerializer):
    attachments = SurveyAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = SurveyProject
        fields = ['id', 'project', 'status', 'description', 'area', 'location_lat', 'location_lng', 'attachments']
        read_only_fields = ['status', 'project']

class SurveyProjectCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_blank=True, required=False)
    area = serializers.FloatField()
    location_lat = serializers.FloatField()
    location_lng = serializers.FloatField()
    attachments = serializers.ListField(
        child=serializers.FileField(),
        allow_empty=True,
        required=False
    )

    def create(self, validated_data):
        user = self.context['request'].user

        title = validated_data['title']
        description = validated_data.get('description', '')
        area = validated_data['area']
        location_lat = validated_data['location_lat']
        location_lng = validated_data['location_lng']
        attachments = validated_data.get('attachments', [])

        # ایجاد پروژه اصلی
        project = Project.objects.create(
            title=title,
            description=description,
            owner=user,
            created_by=user,
            project_type=ProjectType.SURVEY,
            status=ProjectStatus.PENDING,
        )

        # ایجاد پروژه نقشه‌برداری مرتبط
        survey = SurveyProject.objects.create(
            project=project,
            description=description,
            area=area,
            location_lat=location_lat,
            location_lng=location_lng,
        )

        # ذخیره فایل‌ها
        for file in attachments:
            SurveyAttachment.objects.create(
                survey_project=survey,
                file=file,
                uploaded_by=user
            )

        return survey
