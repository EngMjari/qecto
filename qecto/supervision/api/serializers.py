# supervision/api/serializers.py
from rest_framework import serializers
from supervision.models import SupervisionRequest
from projects.api.serializers import ProjectNestedSerializer
from core.serializers import UserSerializer
from projects.models import Project
from core.models import User


class SupervisionRequestSerializer(serializers.ModelSerializer):
    project = ProjectNestedSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    assigned_admin = UserSerializer(read_only=True)
    attachments_count = serializers.IntegerField(
        source='attachments.count', read_only=True)

    class Meta:
        model = SupervisionRequest
        fields = [
            'id',
            'project',
            'owner',
            'assigned_admin',
            'supervision_type',
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


class SupervisionRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all())
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = SupervisionRequest
        fields = [
            'project',
            'owner',
            'supervision_type',
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

        # پروژه‌هایی که این درخواست هنوز ندارند
        if user and not user.is_staff:
            self.fields['project'].queryset = user.projects.all()
            self.fields['owner'].queryset = User.objects.filter(id=user.id)
        else:
            self.fields['project'].queryset = Project.objects.all()
            self.fields['owner'].queryset = User.objects.all()

    def validate(self, attrs):
        project = attrs.get('project')
        supervision_type = attrs.get('supervision_type')
        # اختیاری: می‌تونی چک کنی که پروژه یک درخواست مشابه در همان نوع نظارت نداشته باشد
        if SupervisionRequest.objects.filter(project=project, supervision_type=supervision_type).exists():
            raise serializers.ValidationError(
                "این پروژه قبلاً درخواست نظارت از این نوع دارد.")
        return attrs

    def create(self, validated_data):
        validated_data['status'] = 'pending'
        return super().create(validated_data)
