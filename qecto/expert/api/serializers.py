# expert/api/serializers.py
from rest_framework import serializers
from expert.models import ExpertEvaluationRequest
from projects.models import Project
from attachments.models import Attachment


class ExpertEvaluationRequestSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(
        source='project.title', read_only=True)
    assigned_admin = serializers.CharField(
        source='assigned_admin.username', read_only=True, allow_null=True)

    class Meta:
        model = ExpertEvaluationRequest
        fields = [
            'id', 'project', 'project_title', 'area', 'building_area', 'property_type',
            'main_parcel_number', 'sub_parcel_number', 'status', 'location_lat',
            'location_lng', 'description', 'created_at', 'updated_at', 'assigned_admin'
        ]
        read_only_fields = ['id', 'status',
                            'created_at', 'updated_at', 'assigned_admin']


class ExpertEvaluationRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=False, allow_null=True)
    project_name = serializers.CharField(
        max_length=200, required=False, allow_blank=True)
    building_area = serializers.FloatField(required=False, allow_null=True)
    main_parcel_number = serializers.IntegerField(
        required=False, allow_null=True)
    sub_parcel_number = serializers.IntegerField(
        required=False, allow_null=True)
    attachments = serializers.ListField(
        child=serializers.FileField(), required=False, allow_empty=True, write_only=True)
    titles = serializers.ListField(
        child=serializers.CharField(max_length=100, allow_blank=True),
        required=False, allow_empty=True, write_only=True)

    class Meta:
        model = ExpertEvaluationRequest
        fields = [
            'project', 'project_name', 'area', 'building_area', 'description',
            'main_parcel_number', 'sub_parcel_number', 'property_type',
            'location_lat', 'location_lng', 'status', 'attachments', 'titles'
        ]
        read_only_fields = ['status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        user = request.user if request else None
        qs = Project.objects.filter(expert_request__isnull=True)  # چک OneToOne
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
        if project and ExpertEvaluationRequest.objects.filter(project=project).exists():
            raise serializers.ValidationError(
                "این پروژه قبلاً درخواست کارشناسی دارد.")
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
        expert_request = ExpertEvaluationRequest.objects.create(
            project=project, **validated_data)

        for file, title in zip(attachments, titles or []):
            Attachment.objects.create(
                expert_request=expert_request, file=file, title=title or '')

        return expert_request
