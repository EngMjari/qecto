# registration/api/serializers.py
from rest_framework import serializers
from registration.models import RegistrationRequest
from projects.models import Project
from attachments.models import Attachment
from core.serializers import UserSerializer


class RegistrationRequestSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(
        source='project.title', read_only=True)
    assigned_admin = serializers.CharField(
        source='assigned_admin.username', read_only=True, allow_null=True)
    owner = UserSerializer(read_only=True)

    required_documents = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationRequest
        fields = [
            'id', 'project', 'project_title', 'property_type', 'ownership_status',
            'area', 'building_area', 'main_parcel_number', 'sub_parcel_number',
            'request_survey', 'location_lat', 'location_lng', 'description',
            'status', 'created_at', 'updated_at', 'assigned_admin', 'required_documents'
        ]
        read_only_fields = ['id', 'status',
                            'created_at', 'updated_at', 'assigned_admin']

    def get_required_documents(self, obj):
        return self.context.get('required_documents', '')


class RegistrationRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=False, allow_null=True)
    project_name = serializers.CharField(
        max_length=200, required=False, allow_blank=True)
    area = serializers.FloatField(required=False, allow_null=True)
    building_area = serializers.FloatField(required=False, allow_null=True)
    main_parcel_number = serializers.IntegerField(
        required=False, allow_null=True)
    sub_parcel_number = serializers.IntegerField(
        required=False, allow_null=True)
    request_survey = serializers.BooleanField(default=False)
    location_lat = serializers.FloatField(required=False, allow_null=True)
    location_lng = serializers.FloatField(required=False, allow_null=True)
    attachments = serializers.ListField(
        child=serializers.FileField(), required=False, allow_empty=True, write_only=True)
    titles = serializers.ListField(
        child=serializers.CharField(max_length=100, allow_blank=True),
        required=False, allow_empty=True, write_only=True)

    class Meta:
        model = RegistrationRequest
        fields = [
            'project', 'project_name', 'property_type', 'ownership_status',
            'area', 'building_area', 'main_parcel_number', 'sub_parcel_number',
            'request_survey', 'location_lat', 'location_lng', 'description',
            'status', 'attachments', 'titles'
        ]
        read_only_fields = ['status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        user = request.user if request else None
        qs = Project.objects.filter(registration_request__isnull=True)
        if user and not user.is_staff:
            qs = qs.filter(owner=user)
        self.fields['project'].queryset = qs

    def validate(self, data):
        project = data.get('project')
        project_name = data.get('project_name')
        ownership_status = data.get('ownership_status')
        request_survey = data.get('request_survey', False)
        attachments = data.get('attachments', [])
        titles = data.get('titles', [])

        # اعتبارسنجی پروژه
        if not project and not project_name:
            raise serializers.ValidationError(
                "project_name is required when no project is selected.")
        if project and project_name:
            raise serializers.ValidationError(
                "Cannot provide both project and project_name.")
        if project and RegistrationRequest.objects.filter(project=project).exists():
            raise serializers.ValidationError(
                "این پروژه قبلاً درخواست اخذ سند دارد.")

        # اعتبارسنجی پلاک‌ها برای سند مشاعی
        if ownership_status == 'shared_deed':
            if data.get('main_parcel_number') is None or data.get('sub_parcel_number') is None:
                raise serializers.ValidationError(
                    "برای سند مشاعی، پلاک اصلی و فرعی اجباری هستند.")

        # اعتبارسنجی فایل‌های نقشه UTM
        if not request_survey and attachments:
            utm_map = any(title.lower() == 'نقشه utm' for title in titles)
            coordinates_certificate = any(
                title.lower() == 'گواهی تعیین مختصات' for title in titles)
            if not (utm_map and coordinates_certificate):
                raise serializers.ValidationError(
                    "اگر نقشه UTM دارید، باید فایل‌های 'نقشه UTM' و 'گواهی تعیین مختصات' آپلود شوند.")

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

        registration_request = RegistrationRequest.objects.create(
            project=project, **validated_data)

        for file, title in zip(attachments, titles or []):
            Attachment.objects.create(
                registration_request=registration_request, file=file, title=title or '')

        return registration_request
