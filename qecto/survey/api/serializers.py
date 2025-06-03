
from rest_framework import serializers
from survey.models import SurveyProject, SurveyAttachment

class SurveyAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyAttachment
        fields = ['id', 'file', 'title', 'uploaded_at']


class SurveyProjectSerializer(serializers.ModelSerializer):
    attachments = SurveyAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = SurveyProject
        fields = ['id', 'project', 'status', 'description',
                  'area', 'location_lat', 'location_lng', 'attachments', 'created_at']
        read_only_fields = ['status', 'project']
