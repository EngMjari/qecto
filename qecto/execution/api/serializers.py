# execution/api/serializers.py
from rest_framework import serializers
from execution.models import ExecutionRequest
from projects.models import Project
from attachments.models import Attachment
from core.serializers import UserSerializer


class ExecutionRequestSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(
        source='project.title', read_only=True)
    assigned_admin = serializers.CharField(
        source='assigned_admin.username', read_only=True, allow_null=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = ExecutionRequest
        fields = [
            'id', 'project', 'owner', 'project_title', 'description', 'area', 'building_area',
            'permit_number', 'location_lat', 'location_lng', 'status', 'created_at',
            'updated_at', 'assigned_admin'
        ]
        read_only_fields = ['id', 'status',
                            'created_at', 'updated_at', 'assigned_admin']


class ExecutionRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=False, allow_null=True)
    project_name = serializers.CharField(
        max_length=200, required=False, allow_blank=True)
    area = serializers.FloatField(required=False, allow_null=True)
    building_area = serializers.FloatField(required=False, allow_null=True)
    permit_number = serializers.CharField(
        max_length=100, required=False, allow_blank=True)
    location_lat = serializers.FloatField(required=False, allow_null=True)
    location_lng = serializers.FloatField(required=False, allow_null=True)
    attachments = serializers.ListField(
        child=serializers.FileField(), required=False, allow_empty=True, write_only=True)
    titles = serializers.ListField(
        child=serializers.CharField(max_length=100, allow_blank=True),
        required=False, allow_empty=True, write_only=True)

    class Meta:
        model = ExecutionRequest
        fields = [
            'project', 'project_name', 'description', 'area', 'building_area',
            'permit_number', 'location_lat', 'location_lng', 'status',
            'attachments', 'titles'
        ]
        read_only_fields = ['status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        user = request.user if request else None
        qs = Project.objects.filter(
            execution_request__isnull=True)  # چک OneToOne
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
        if project and ExecutionRequest.objects.filter(project=project).exists():
            raise serializers.ValidationError(
                "این پروژه قبلاً درخواست اجرا دارد.")
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

        execution_request = ExecutionRequest.objects.create(
            project=project, **validated_data)

        for file, title in zip(attachments, titles or []):
            Attachment.objects.create(
                execution_request=execution_request, file=file, title=title or '')

        return execution_request
