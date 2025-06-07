# projects/api/serializers.py
from rest_framework import serializers
from projects.models import Project, ProjectType, ProjectStatus
from django.contrib.auth import get_user_model
from survey.api.serializers import SurveyProjectSerializer
from survey.models import SurveyProject, SurveyAttachment
from expert.api.serializers import ExpertEvaluationProject, ExpertEvaluationProjectSerializer
from core.serializers import UserSerializer
User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'description',
                  'project_type', 'status', 'created_at']


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
                title=title,
                file=file,
                uploaded_by=user
            )

        return survey


class ProjectDetailSerializer(serializers.ModelSerializer):
    survey = serializers.SerializerMethodField()
    expert = serializers.SerializerMethodField()
    request_count = serializers.SerializerMethodField()
    assigned_to = UserSerializer()

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'status', 'created_at',
                  'survey', 'expert', 'request_count', 'assigned_to']

    def get_survey(self, obj):
        try:
            sub = SurveyProject.objects.get(project=obj)
            return SurveyProjectSerializer(sub).data
        except SurveyProject.DoesNotExist:
            return None

    def get_expert(self, obj):
        try:
            sub = ExpertEvaluationProject.objects.get(project=obj)
            return ExpertEvaluationProjectSerializer(sub).data
        except ExpertEvaluationProject.DoesNotExist:
            return None

    def get_request_count(self, obj):
        count = 0
        if SurveyProject.objects.filter(project=obj).exists():
            count += 1
        if ExpertEvaluationProject.objects.filter(project=obj).exists():
            count += 1
        return count


class CreateProjectSerializer(serializers.Serializer):
    project_type = serializers.ChoiceField(
        choices=['survey', 'expert'])
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)

# TODO: serializer ha ro check kon moratab bashan


class ProjectDataSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer()
    requests = serializers.SerializerMethodField()
    request_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'status', 'created_at',
            'assigned_to', 'requests', 'request_count'
        ]

    def get_requests(self, obj):
        # گرفتن درخواست‌های نقشه‌برداری
        surveys = SurveyProject.objects.filter(project=obj).values(
            'id', 'status', 'created_at', 'location_lat', 'location_lng', 'area', 'main_parcel_number', 'sub_parcel_number', 'property_type'
        )
        surveys = [{**item, 'type': 'survey'} for item in surveys]

        # گرفتن درخواست‌های کارشناسی
        experts = ExpertEvaluationProject.objects.filter(project=obj).values(
            'id', 'status', 'created_at', 'location_lat', 'location_lng', 'area', 'main_parcel_number', 'sub_parcel_number', 'property_type'
        )
        experts = [{**item, 'type': 'expert'} for item in experts]

        # ترکیب و مرتب‌سازی بر اساس تاریخ ایجاد
        all_requests = surveys + experts
        all_requests.sort(key=lambda x: x['created_at'], reverse=True)
        return all_requests

    def get_request_count(self, obj):
        survey_count = SurveyProject.objects.filter(project=obj).count()
        expert_count = ExpertEvaluationProject.objects.filter(
            project=obj).count()
        return survey_count + expert_count
