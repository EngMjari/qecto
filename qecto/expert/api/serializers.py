# Expert/api/serializers.py : 
from rest_framework import serializers
from expert.models import ExpertEvaluationProject, ExpertAttachment
from django.contrib.auth import get_user_model
from projects.models import Project, ProjectType, ProjectStatus

User = get_user_model()

# --- سریالایزر فایل‌های پیوست کارشناسی ---
class ExpertAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpertAttachment
        fields = ['id', 'file', 'uploaded_at']


# --- سریالایزر پروژه کارشناسی (نمایش) ---
class ExpertEvaluationProjectSerializer(serializers.ModelSerializer):
    attachments = ExpertAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ExpertEvaluationProject
        fields = [
            'id', 'project', 'property_type', 'main_parcel_number', 'sub_parcel_number',
            'location_lat', 'location_lng', 'description', 'created_at', 'attachments', 'status'
        ]
        read_only_fields = ['project', 'created_at']


# --- سریالایزر ایجاد پروژه کارشناسی (فرانت‌اند فرم ارسال) ---
class ExpertEvaluationProjectCreateSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(),
        allow_empty=True,
        required=False,
        write_only=True
    )
    title = serializers.CharField(max_length=200, write_only=True)

    class Meta:
        model = ExpertEvaluationProject
        fields = [
            'title', 'description', 'property_type',
            'main_parcel_number', 'sub_parcel_number',
            'location_lat', 'location_lng', 'attachments'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        print("FILES in context:", request.FILES if request else "No request in context")
        attachments = request.FILES.getlist('attachments')
        print("FILES RECEIVED in create:", attachments)
        user = request.user if request else None

        # دریافت فایل‌ها و حذف از validated_data
        attachments = validated_data.pop('attachments', [])
        title = validated_data.pop('title', '')

        # ایجاد پروژه پایه
        project = Project.objects.create(
            title=title,
            description=validated_data.get('description', ''),
            owner=user,
            created_by=user,
            project_type=ProjectType.Expert,
            status=ProjectStatus.PENDING,
        )

        # ایجاد پروژه کارشناسی
        expert_project = ExpertEvaluationProject.objects.create(
            project=project,
            **validated_data
        )

        # ذخیره فایل‌های پیوست
        for file in attachments:
            ExpertAttachment.objects.create(
                project=expert_project,
                file=file,
                uploaded_by=user,
                title=file.name
            )

        return expert_project
