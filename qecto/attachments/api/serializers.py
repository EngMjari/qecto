from rest_framework import serializers
from attachments.models import Attachment
from django.contrib.contenttypes.models import ContentType
from django.core.files.uploadedfile import InMemoryUploadedFile
import os

ALLOWED_EXTENSIONS = {'.dwg', '.dxf', '.xlsx',
                      '.xls', '.pdf', '.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_INITIAL_FILES = 10


class AttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    file_format = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'title', 'file_url', 'file_size',
                  'file_format', 'uploaded_by', 'uploaded_at']

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None

    def get_file_size(self, obj):
        return obj.file.size if obj.file else 0

    def get_file_format(self, obj):
        if obj.file:
            _, ext = os.path.splitext(obj.file.name)
            return ext.lower()[1:] if ext else 'unknown'
        return 'unknown'


class AttachmentCreateSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
    title = serializers.CharField(
        max_length=100, required=False, allow_blank=True)
    content_type = serializers.CharField(write_only=True)
    object_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Attachment
        fields = ['file', 'title', 'content_type', 'object_id']

    def validate_file(self, value):
        if not isinstance(value, InMemoryUploadedFile):
            raise serializers.ValidationError("فایل نامعتبر است.")
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                "حجم فایل باید کمتر از ۵ مگابایت باشد.")
        _, ext = os.path.splitext(value.name)
        ext = ext.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                "فرمت فایل باید یکی از موارد باشد: dwg, dxf, xlsx, xls, pdf, jpg, jpeg, png")
        return value

    def validate(self, data):
        content_type_name = data.get('content_type')
        object_id = data.get('object_id')
        try:
            content_type = ContentType.objects.get(
                model=content_type_name.lower())
            model_class = content_type.model_class()
            if not model_class.objects.filter(id=object_id).exists():
                raise serializers.ValidationError("درخواست موردنظر یافت نشد.")
        except ContentType.DoesNotExist:
            raise serializers.ValidationError("نوع درخواست نامعتبر است.")

        if content_type_name.lower() in ['supervisionrequest', 'registrationrequest']:
            existing_count = Attachment.objects.filter(
                content_type=content_type, object_id=object_id).count()
            if existing_count >= MAX_INITIAL_FILES:
                raise serializers.ValidationError(
                    f"حداکثر {MAX_INITIAL_FILES} فایل مجاز است.")
        return data

    def create(self, validated_data):
        content_type_name = validated_data.pop('content_type')
        object_id = validated_data.pop('object_id')
        content_type = ContentType.objects.get(model=content_type_name.lower())
        file = validated_data.get('file')
        title = validated_data.get('title') or file.name
        attachment = Attachment.objects.create(
            content_type=content_type,
            object_id=object_id,
            file=file,
            title=title,
            uploaded_by=self.context['request'].user
        )
        return attachment
