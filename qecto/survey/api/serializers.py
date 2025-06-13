from rest_framework import serializers
from survey.models import SurveyRequest
from projects.api.serializers import ProjectNestedSerializer
from core.serializers import UserSerializer
from projects.models import Project
from attachments.api.serializers import AttachmentSerializer
from attachments.models import Attachment
from django.contrib.contenttypes.models import ContentType  # اضافه شده


class SurveyRequestSerializer(serializers.ModelSerializer):
    project = ProjectNestedSerializer(read_only=True)
    assigned_admin = UserSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    attachments_count = serializers.IntegerField(
        source='attachments.count', read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = SurveyRequest
        fields = [
            'id', 'project', 'owner', 'assigned_admin', 'description', 'area',
            'building_area', 'main_parcel_number', 'sub_parcel_number',
            'property_type', 'location_lat', 'location_lng',
            'created_at', 'updated_at', 'status', 'attachments_count',
            'attachments'
        ]


class SurveyRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=False, allow_null=True)
    project_name = serializers.CharField(
        max_length=255, required=False, allow_blank=True)
    building_area = serializers.FloatField(required=False, allow_null=True)
    main_parcel_number = serializers.IntegerField(
        required=False, allow_null=True)
    sub_parcel_number = serializers.IntegerField(
        required=False, allow_null=True)
    attachments = serializers.ListField(
        child=serializers.FileField(), required=False, write_only=True)
    titles = serializers.ListField(
        child=serializers.CharField(max_length=255, allow_blank=True),
        required=False, write_only=True)
    location_lat = serializers.FloatField(required=True)
    location_lng = serializers.FloatField(required=True)

    class Meta:
        model = SurveyRequest
        fields = [
            'project', 'project_name', 'description', 'area', 'building_area',
            'main_parcel_number', 'sub_parcel_number', 'property_type',
            'location_lat', 'location_lng', 'status', 'attachments', 'titles'
        ]
        read_only_fields = ['status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        user = request.user if request else None
        qs = Project.objects.filter(survey_request__isnull=True)
        if user and not user.is_staff:
            qs = qs.filter(owner=user)
        self.fields['project'].queryset = qs

    def validate(self, data):
        project = data.get('project')
        project_name = data.get('project_name')
        if not project and not project_name:
            raise serializers.ValidationError(
                "project_name is required when no project is selected.")
        if project and project_name:
            raise serializers.ValidationError(
                "Cannot provide both project and project_name.")
        if project and SurveyRequest.objects.filter(project=project).exists():
            raise serializers.ValidationError(
                "این پروژه قبلاً درخواست نقشه‌برداری دارد.")
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user

        project = validated_data.pop('project', None)
        project_name = validated_data.pop('project_name', None)
        attachments = validated_data.pop('attachments', [])
        titles = validated_data.pop('titles', [])

        if project_name and not project:
            project = Project.objects.create(
                owner=user, title=project_name, created_by=user)
        elif not project:
            raise serializers.ValidationError(
                "A project must be provided or created with project_name.")

        validated_data['status'] = 'pending'
        validated_data['owner'] = user
        survey_request = SurveyRequest.objects.create(
            project=project, **validated_data)

        for file, title in zip(attachments, titles or []):
            Attachment.objects.create(
                content_type=ContentType.objects.get_for_model(SurveyRequest),
                object_id=survey_request.id,
                file=file,
                title=title or '',
                uploaded_by=user
            )

        return survey_request
