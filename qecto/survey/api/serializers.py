# survey/api/serializers.py :
from rest_framework import serializers
from survey.models import SurveyProject, SurveyAttachment


class SurveyAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyAttachment
        fields = ['id', 'file', 'title', 'uploaded_at']


class SurveyProjectSerializer(serializers.ModelSerializer):
    attachments = SurveyAttachmentSerializer(many=True, read_only=True)
    project = serializers.SerializerMethodField()
    request_type = serializers.SerializerMethodField()

    class Meta:
        model = SurveyProject
        fields = ['id', 'project', 'status', 'description',
                  'area', 'location_lat', 'location_lng', 'attachments', 'created_at', 'request_type', "property_type"]
        read_only_fields = ['status', 'project']

    def get_project(self, obj):
        from projects.api.serializers import ProjectDataSerializer  # ✅ ایمپورت تنبل
        return ProjectDataSerializer(obj.project).data

    def get_request_type(self, obj):
        return 'survey'
