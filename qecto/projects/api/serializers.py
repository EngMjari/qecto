# projects/api/serializers.py :
from rest_framework import serializers
from projects.models import Project
from django.contrib.auth import get_user_model
from core.serializers import UserSerializer

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
