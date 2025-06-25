# qecto/registration/api/serializers.py
import logging
from rest_framework import serializers
from registration.models import RegistrationRequest
from projects.models import Project
from attachments.models import Attachment
from django.db import transaction
from core.serializers import UserSerializer
from attachments.api.serializers import AttachmentSerializer


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
        qs = Project.objects.all()
        if user and not user.is_staff:
            qs = qs.filter(owner=user)
        self.fields['project'].queryset = qs
        # لاگ برای دیباگ
        logger = logging.getLogger(__name__)
        logger.info("Project queryset: %s", qs.values_list('id', flat=True))

    def validate(self, data):
        logger = logging.getLogger(__name__)
        logger.info("Validated data: %s", data)

        project = data.get('project')
        project_name = data.get('project_name')
        ownership_status = data.get('ownership_status')

        logger.info("Project: %s, Project_name: %s", project, project_name)

        if not project and not project_name:
            logger.error("No project or project_name provided")
            raise serializers.ValidationError(
                "لطفاً یک پروژه انتخاب کنید یا عنوان پروژه جدید وارد کنید.")
        if project and project_name:
            logger.error("Both project and project_name provided")
            raise serializers.ValidationError(
                "نمی‌توانید هم پروژه انتخاب کنید و هم عنوان پروژه جدید وارد کنید.")
        if project and RegistrationRequest.objects.filter(project=project).exists():
            logger.info(
                "Registration request exists for project: %s", project.id)
            raise serializers.ValidationError(
                "برای این پروژه یک درخواست اخذ سند ثبت شده.")

        if ownership_status == 'shared_deed':
            if data.get('main_parcel_number') is None or data.get('sub_parcel_number') is None:
                logger.error(
                    "Main or sub parcel number missing for shared_deed")
                raise serializers.ValidationError(
                    "برای سند مشاعی، پلاک اصلی و فرعی اجباری هستند.")

        return data

    @transaction.atomic
    def create(self, validated_data):
        logger = logging.getLogger(__name__)
        logger.info(
            "Creating registration request with validated data: %s", validated_data)

        request = self.context.get('request')
        user = request.user

        project = validated_data.pop('project', None)
        project_name = validated_data.pop('project_name', None)
        attachments = validated_data.pop('attachments', [])
        titles = validated_data.pop('titles', [])

        if project_name and not project:
            logger.info("Creating new project with title: %s", project_name)
            project = Project.objects.create(
                owner=user, title=project_name, created_by=user)
        elif not project:
            logger.error("No valid project provided")
            raise serializers.ValidationError(
                "یک پروژه باید انتخاب یا با عنوان پروژه جدید ایجاد شود.")

        validated_data['status'] = 'pending'
        validated_data['owner'] = user
        validated_data['project'] = project

        registration_request = RegistrationRequest.objects.create(
            **validated_data)
        logger.info("Registration request created: %s",
                    registration_request.id)

        for file, title in zip(attachments, titles or []):
            Attachment.objects.create(
                registration_request=registration_request, file=file, title=title or '')

        return registration_request


class RegistrationRequestUpdateSerializer(serializers.ModelSerializer):
    assigned_admin = UserSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = RegistrationRequest
        fields = [
            'id', 'project', 'property_type', 'ownership_status', 'area',
            'building_area', 'main_parcel_number', 'sub_parcel_number',
            'request_survey', 'location_lat', 'location_lng', 'description',
            'status', 'assigned_admin', 'attachments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'project',
                            'assigned_admin', 'created_at', 'updated_at']

    def validate(self, data):
        logger = logging.getLogger(__name__)
        logger.info("Validated data for update: %s", data)

        ownership_status = data.get(
            'ownership_status', self.instance.ownership_status)
        if ownership_status == 'shared_deed':
            main_parcel = data.get('main_parcel_number',
                                   self.instance.main_parcel_number)
            sub_parcel = data.get('sub_parcel_number',
                                  self.instance.sub_parcel_number)
            if main_parcel is None or sub_parcel is None:
                logger.error(
                    "Main or sub parcel number missing for shared_deed")
                raise serializers.ValidationError(
                    "برای سند مشاعی، پلاک اصلی و فرعی اجباری هستند.")
        return data
