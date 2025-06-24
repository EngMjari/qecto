# projects/api/serializers.py :
from rest_framework import serializers
from projects.models import Project
from django.contrib.auth import get_user_model
from core.serializers import UserSerializer
from requests.api.serializers import (
    SurveyRequestSerializer,
    SupervisionRequestSerializer,
    ExpertEvaluationRequestSerializer,
    ExecutionRequestSerializer,
    RegistrationRequestSerializer,
)
User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'owner',
                  'created_by', 'created_at', 'updated_at']


class ProjectCreateSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False)

    class Meta:
        model = Project
        fields = ['title', 'description', 'owner']

    def validate_owner(self, value):
        request = self.context.get('request')
        user = request.user
        if not user.is_staff and value is not None and value != user:
            raise serializers.ValidationError(
                "شما نمی‌توانید مالک پروژه را برای کاربر دیگر تعیین کنید."
            )
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user

        owner = validated_data.pop('owner', None)
        if owner is None or not user.is_staff:
            owner = user

        project = Project.objects.create(
            owner=owner,
            created_by=user,
            **validated_data
        )
        return project


class ProjectNestedSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'owner',
                  'created_by', 'created_at', 'updated_at']


class ProjectWithRequestsSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    requests = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'owner',
                  'created_by', 'created_at', 'updated_at', 'requests']

    def get_requests(self, obj):
        requests = obj.all_requests()
        request_data = []
        for request in requests:
            # تعیین نوع درخواست بر اساس نوع مدل
            model_name = request.__class__.__name__
            if model_name == 'SurveyRequest':
                serializer = SurveyRequestSerializer(request)
                request_data.append(serializer.data)
            elif model_name == 'SupervisionRequest':
                serializer = SupervisionRequestSerializer(request)
                request_data.append(serializer.data)
            elif model_name == 'ExpertRequest':
                serializer = ExpertEvaluationRequestSerializer(request)
                request_data.append(serializer.data)
            elif model_name == 'ExecutionRequest':
                serializer = ExecutionRequestSerializer(request)
                request_data.append(serializer.data)
            elif model_name == 'RegistrationRequest':
                serializer = RegistrationRequestSerializer(request)
                request_data.append(serializer.data)
        return request_data
