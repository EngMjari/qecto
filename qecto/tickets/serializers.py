from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import TicketSession, TicketMessage
from attachments.models import Attachment
from attachments.serializers import AttachmentSerializer


class TicketMessageSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    sender = serializers.SerializerMethodField()

    class Meta:
        model = TicketMessage
        fields = ['id', 'message', 'created_at', 'attachments', 'sender']

    def get_sender(self, obj):
        return {
            "id": obj.sender.id,
            "username": obj.sender.get_username(),
        }


class TicketSessionSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    assigned_admin = serializers.SerializerMethodField()
    related_request = serializers.SerializerMethodField()

    class Meta:
        model = TicketSession
        fields = [
            'id', 'title', 'session_type', 'status', 'reply_status', 'last_message_by',
            'closed_reason', 'created_at', 'updated_at', 'user', 'assigned_admin',
            'related_request', 'messages'
        ]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.get_username(),
        }

    def get_assigned_admin(self, obj):
        if obj.assigned_admin:
            return {
                "id": obj.assigned_admin.id,
                "username": obj.assigned_admin.get_username(),
            }
        return None

    def get_related_request(self, obj):
        if obj.related_request:
            return {
                "id": obj.object_id,
                "type": obj.content_type.model,  # e.g. "surveyrequest"
                "app_label": obj.content_type.app_label,
                # readable string representation
                "str": str(obj.related_request)
            }
        return None


class CreateTicketMessageSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(), required=False, write_only=True
    )

    class Meta:
        model = TicketMessage
        fields = ['message', 'attachments']

    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        message = TicketMessage.objects.create(**validated_data)
        for file in attachments_data:
            Attachment.objects.create(
                content_object=message,
                file=file
            )
        return message


class CreateTicketSessionSerializer(serializers.ModelSerializer):
    initial_message = CreateTicketMessageSerializer(write_only=True)
    content_type = serializers.CharField(write_only=True)
    object_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TicketSession
        fields = [
            'title', 'session_type', 'content_type', 'object_id',
            'initial_message'
        ]

    def validate_content_type(self, value):
        try:
            return ContentType.objects.get(model=value.lower())
        except ContentType.DoesNotExist:
            raise serializers.ValidationError("Invalid content type.")

    def create(self, validated_data):
        initial_message_data = validated_data.pop('initial_message')
        content_type = validated_data.pop('content_type')
        object_id = validated_data.pop('object_id')
        user = self.context['request'].user

        ticket_session = TicketSession.objects.create(
            user=user,
            content_type=content_type,
            object_id=object_id,
            **validated_data
        )

        initial_message_serializer = CreateTicketMessageSerializer(
            data=initial_message_data)
        initial_message_serializer.is_valid(raise_exception=True)
        initial_message_serializer.save(
            ticket=ticket_session,
            sender=user
        )

        return ticket_session
