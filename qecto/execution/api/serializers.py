# execution/api/serializers.py
from rest_framework import serializers
from execution.models import ExecutionRequest
from projects.api.serializers import ProjectNestedSerializer
from core.serializers import UserSerializer
from projects.models import Project
from core.models import User


class ExecutionRequestSerializer(serializers.ModelSerializer):
    project = ProjectNestedSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    assigned_admin = UserSerializer(read_only=True)
    attachments_count = serializers.IntegerField(
        source='attachments.count', read_only=True)

    class Meta:
        model = ExecutionRequest
        fields = [
            'id',
            'project',
            'owner',
            'assigned_admin',
            'description',
            'area',
            'building_area',
            'permit_number',
            'location_lat',
            'location_lng',
            'status',
            'created_at',
            'updated_at',
            'attachments_count',
        ]


class ExecutionRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all())
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = ExecutionRequest
        fields = [
            'project',
            'owner',
            'description',
            'area',
            'building_area',
            'permit_number',
            'location_lat',
            'location_lng',
            'status',
        ]
        read_only_fields = ['status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        user = request.user if request else None

        from projects.models import Project
        from django.contrib.auth import get_user_model
        User = get_user_model()

        if user and not user.is_staff:
            self.fields['project'].queryset = user.projects.all()
            self.fields['owner'].queryset = User.objects.filter(id=user.id)
        else:
            self.fields['project'].queryset = Project.objects.all()
            self.fields['owner'].queryset = User.objects.all()

    def validate(self, attrs):
        project = attrs.get('project')
        owner = attrs.get('owner')
        # اگر لازم بود می‌تونی چک‌های بیشتری اضافه کنی

        return attrs

    def create(self, validated_data):
        validated_data['status'] = 'pending'
        return super().create(validated_data)
