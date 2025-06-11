from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    content_type = serializers.SlugRelatedField(
        queryset=ContentType.objects.all(),
        slug_field='model',
        write_only=True
    )
    file_url = serializers.SerializerMethodField()
    uploaded_by_username = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = [
            'id',
            'title',
            'file',
            'file_url',
            'uploaded_by',
            'uploaded_by_username',
            'uploaded_at',
            'content_type',
            'object_id',
        ]
        read_only_fields = ['id', 'uploaded_at',
                            'uploaded_by', 'file_url', 'uploaded_by_username']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_uploaded_by_username(self, obj):
        return obj.uploaded_by.username if obj.uploaded_by else None

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['uploaded_by'] = user
        return super().create(validated_data)
