# survey/api/serializers.py :
from survey.models import SurveyAttachment
from rest_framework import serializers
from survey.models import SurveyProject, SurveyAttachment


class SurveyAttachmentSerializer(serializers.ModelSerializer):
    file_extension = serializers.SerializerMethodField()
    readable_file_size = serializers.SerializerMethodField()

    class Meta:
        model = SurveyAttachment
        fields = ['id', 'file', 'title', 'uploaded_at', 'uploaded_by',
                  'file_extension', 'readable_file_size']

    def get_file_extension(self, obj):
        return obj.file_extension() if hasattr(obj, 'file_extension') else obj.file.name.split('.')[-1].lower()

    def get_readable_file_size(self, obj):
        return obj.readable_file_size() if hasattr(obj, 'readable_file_size') else obj.file.size


class SurveyProjectSerializer(serializers.ModelSerializer):
    attachments = SurveyAttachmentSerializer(many=True, read_only=True)
    project = serializers.SerializerMethodField()
    request_type = serializers.SerializerMethodField()
    assigned_admin = serializers.SerializerMethodField()

    class Meta:
        model = SurveyProject
        fields = ['id', 'project', 'status', 'description',
                  'area', 'location_lat', 'location_lng', 'attachments', 'created_at', 'request_type', "property_type", "main_parcel_number", "sub_parcel_number", "assigned_admin"]
        read_only_fields = ['status', 'project']

    def get_project(self, obj):
        from projects.api.serializers import ProjectDataSerializer  # ✅ ایمپورت تنبل
        return ProjectDataSerializer(obj.project).data

    def get_request_type(self, obj):
        return 'survey'

    def get_assigned_admin(self, obj):
        if obj.assigned_admin:
            return {
                'name': obj.assigned_admin.full_name,
            }
        return None
