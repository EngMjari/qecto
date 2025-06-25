from rest_framework import serializers
from .models import Referral
from core.serializers import UserSerializer
from django.contrib.contenttypes.models import ContentType
from projects.models import Project


class ReferralSerializer(serializers.ModelSerializer):
    referrer_admin = UserSerializer(read_only=True)
    assigned_admin = UserSerializer()
    request_type = serializers.CharField(
        source='content_type.model', read_only=True)
    request_id = serializers.UUIDField(source='object_id')
    project_title = serializers.SerializerMethodField()
    project_id = serializers.SerializerMethodField()

    class Meta:
        model = Referral
        fields = [
            'id',
            'content_type',
            'object_id',
            'request_type',
            'request_id',
            'project_id',
            'project_title',
            'referrer_admin',
            'assigned_admin',
            'description',
            'created_at',
        ]
        read_only_fields = ['referrer_admin',
                            'created_at', 'request_type', 'request_id']

    def get_project_title(self, obj):
        try:
            model_class = obj.content_type.model_class()
            request_obj = model_class.objects.select_related(
                'project').get(id=obj.object_id)
            return request_obj.project.title
        except (model_class.DoesNotExist, AttributeError):
            return None

    def get_project_id(self, obj):
        try:
            model_class = obj.content_type.model_class()
            request_obj = model_class.objects.select_related(
                'project').get(id=obj.object_id)
            return request_obj.project.id
        except (model_class.DoesNotExist, AttributeError):
            return None

    def validate(self, data):
        content_type = data.get('content_type')
        object_id = data.get('object_id')

        # اعتبارسنجی نوع درخواست
        if content_type.model not in [
            'surveyrequest',
            'supervisionrequest',
            'expertevaluationrequest',
            'executionrequest',
            'registrationrequest',
        ]:
            raise serializers.ValidationError("Invalid request type")

        # اعتبارسنجی وجود درخواست
        try:
            model_class = content_type.model_class()
            model_class.objects.get(id=object_id)
        except model_class.DoesNotExist:
            raise serializers.ValidationError(
                f"Request with ID {object_id} does not exist for {content_type.model}")

        # اعتبارسنجی assigned_admin
        assigned_admin = data.get('assigned_admin')
        if not assigned_admin.is_staff:
            raise serializers.ValidationError(
                "Assigned admin must be a staff user")

        return data
