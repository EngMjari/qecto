from rest_framework import serializers
from tickets.models import TicketSession, TicketMessage
from attachments.models import Attachment
from django.contrib.contenttypes.models import ContentType
from attachments.api.serializers import AttachmentSerializer
from core.serializers import UserSerializer
from survey.models import SurveyRequest
from supervision.models import SupervisionRequest
from expert.models import ExpertEvaluationRequest
from execution.models import ExecutionRequest
from registration.models import RegistrationRequest


class MessageAttachmentCreateSerializer(serializers.Serializer):
    file = serializers.FileField()
    title = serializers.CharField(
        max_length=255, required=False, allow_blank=True)


class TicketMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'sender', 'message', 'attachments', 'created_at']


class TicketMessageCreateSerializer(serializers.Serializer):
    message = serializers.CharField(required=False, allow_blank=True)
    attachments = serializers.ListField(
        child=serializers.FileField(),
        required=False,
    )

    def validate(self, data):
        if not data.get('message') and not data.get('attachments'):
            raise serializers.ValidationError('پیام یا فایل الزامی است.')
        return data

    def create(self, validated_data):
        ticket = self.context['ticket']
        user = self.context['request'].user
        attachments_data = validated_data.pop('attachments', [])
        message = TicketMessage.objects.create(
            ticket=ticket,
            sender=user,
            message=validated_data.get('message', '')
        )
        for file in attachments_data:
            attachment = Attachment.objects.create(
                content_type=ContentType.objects.get_for_model(TicketMessage),
                object_id=message.id,
                file=file,
                title=file.name,
                uploaded_by=user
            )
            message.attachments.add(attachment)
        ticket.last_message_by = 'admin' if user.is_staff else 'user'
        ticket.save()
        return message


class TicketSessionSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    assigned_admin = UserSerializer(read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    session_type_display = serializers.CharField(
        source='get_session_type_display', read_only=True)
    related_request_id = serializers.SerializerMethodField()

    def get_related_request_id(self, obj):
        return str(obj.object_id)

    class Meta:
        model = TicketSession
        fields = [
            'id', 'title', 'status', 'status_display', 'session_type',
            'session_type_display', 'created_at', 'updated_at', 'user',
            'assigned_admin', 'last_message_by', 'messages', 'related_request_id',
            'closed_reason', 'content_type'
        ]


class TicketSessionCreateSerializer(serializers.ModelSerializer):
    content_type = serializers.IntegerField(write_only=True)
    object_id = serializers.UUIDField(write_only=True)
    attachments = MessageAttachmentCreateSerializer(many=True, required=False)

    class Meta:
        model = TicketSession
        fields = ['title', 'session_type',
                  'content_type', 'object_id', 'attachments']

    def validate(self, data):
        content_type_id = data.get('content_type')
        object_id = data.get('object_id')
        model_map = {
            'survey': SurveyRequest,
            'supervision': SupervisionRequest,
            'expert': ExpertEvaluationRequest,
            'execution': ExecutionRequest,
            'registration': RegistrationRequest,
        }
        try:
            content_type = ContentType.objects.get(pk=content_type_id)
            model = content_type.model_class()
            if model not in model_map.values():
                raise serializers.ValidationError('نوع محتوا نامعتبر است.')
            model.objects.get(pk=object_id)
        except (ContentType.DoesNotExist, model.DoesNotExist):
            raise serializers.ValidationError(
                'شناسه محتوا یا نوع محتوا نامعتبر است.')
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        attachments_data = validated_data.pop('attachments', [])
        ticket = TicketSession.objects.create(
            user=user,
            title=validated_data['title'],
            session_type=validated_data['session_type'],
            content_type=ContentType.objects.get(
                pk=validated_data['content_type']),
            object_id=validated_data['object_id']
        )
        if attachments_data:
            message = TicketMessage.objects.create(
                ticket=ticket,
                sender=user,
                message=''
            )
            for attachment_data in attachments_data:
                attachment = Attachment.objects.create(
                    content_type=ContentType.objects.get_for_model(
                        TicketMessage),
                    object_id=message.id,
                    file=attachment_data['file'],
                    title=attachment_data.get(
                        'title', '') or attachment_data['file'].name,
                    uploaded_by=user
                )
                message.attachments.add(attachment)
            ticket.last_message_by = 'admin' if user.is_staff else 'user'
            ticket.save()
        return ticket
