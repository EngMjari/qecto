# survey/api/serializers.py
from rest_framework import serializers
from survey.models import SurveyRequest
from projects.api.serializers import ProjectNestedSerializer
from core.serializers import UserSerializer
from projects.models import Project


class SurveyRequestSerializer(serializers.ModelSerializer):
    project = ProjectNestedSerializer(read_only=True)
    assigned_admin = UserSerializer(read_only=True)
    attachments_count = serializers.IntegerField(
        source='attachments.count', read_only=True)

    class Meta:
        model = SurveyRequest
        fields = [
            'id',
            'project',
            'assigned_admin',
            'description',
            'area',
            'main_parcel_number',
            'sub_parcel_number',
            'property_type',
            'location_lat',
            'location_lng',
            'created_at',
            'updated_at',
            'status',
            'attachments_count',
        ]


class SurveyRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all())

    class Meta:
        model = SurveyRequest
        fields = [
            'project',
            'description',
            'area',
            'main_parcel_number',
            'sub_parcel_number',
            'property_type',
            'location_lat',
            'location_lng',
            'status',
        ]
        read_only_fields = ['status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # برای اینکه queryset پروژه فقط پروژه‌هایی باشه که هنوز درخواست نقشه برداری ندارند
        request = self.context.get('request')
        user = request.user if request else None
        qs = None
        if user and not user.is_staff:
            # اگر لازم بود می‌تونی اینجا پروژه‌ها رو فیلتر کنی مثلاً فقط پروژه‌های متعلق به خود کاربر
            qs = user.projects.filter(survey__isnull=True)
        else:
            from projects.models import Project
            qs = Project.objects.filter(survey__isnull=True)
        self.fields['project'].queryset = qs

    def validate_project(self, value):
        if SurveyRequest.objects.filter(project=value).exists():
            raise serializers.ValidationError(
                "این پروژه قبلاً درخواست نقشه‌برداری دارد.")
        return value

    def create(self, validated_data):
        # status رو همیشه روی pending بذار
        validated_data['status'] = 'pending'
        return super().create(validated_data)
