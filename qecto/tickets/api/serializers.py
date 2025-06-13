from rest_framework import serializers
from tickets.models import TicketSession, TicketMessage
from attachments.api.serializers import AttachmentSerializer, AttachmentCreateSerializer
from core.serializers import UserSerializer
from django.contrib.contenttypes.models import ContentType
from attachments.models import Attachment


class TicketMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'sender', 'message', 'attachments', 'created_at']
        read_only_fields = ['sender', 'created_at']


class TicketSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_admin = UserSerializer(read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)
    related_request_id = serializers.UUIDField(
        source='object_id', read_only=True)
    session_type_display = serializers.CharField(
        source='get_session_type_display', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)

    class Meta:
        model = TicketSession
        fields = [
            'id', 'title', 'session_type', 'session_type_display', 'content_type',
            'related_request_id', 'user', 'assigned_admin', 'status', 'status_display',
            'reply_status', 'last_message_by', 'closed_reason', 'created_at',
            'updated_at', 'messages'
        ]
        read_only_fields = [
            'user', 'assigned_admin', 'status', 'reply_status', 'last_message_by',
            'created_at', 'updated_at', 'messages'
        ]


class TicketSessionCreateSerializer(serializers.ModelSerializer):
    content_type = serializers.CharField(required=False, allow_blank=True)
    object_id = serializers.UUIDField(required=False, allow_null=True)
    attachments = AttachmentCreateSerializer(many=True, required=False)

    class Meta:
        model = TicketSession
        fields = ['title', 'session_type',
                  'content_type', 'object_id', 'attachments']

    def validate(self, data):
        session_type = data.get('session_type')
        content_type = data.get('content_type')
        object_id = data.get('object_id')
        user = self.context['request'].user

        if session_type != 'general':
            if not content_type or not object_id:
                raise serializers.ValidationError(
                    'برای سشن‌های غیرعمومی، درخواست مرتبط اجباری است.')
            try:
                ct = ContentType.objects.get(model=content_type.lower())
                model_class = ct.model_class()
                request_obj = model_class.objects.get(id=object_id)
                # چک دسترسی کاربر
                if not user.is_superuser:
                    if hasattr(request_obj, 'owner'):
                        if request_obj.owner != user:
                            raise serializers.ValidationError(
                                'شما به این درخواست دسترسی ندارید.')
                    elif request_obj.project.owner != user:
                        raise serializers.ValidationError(
                            'شما به این درخواست دسترسی ندارید.')
                # چک سشن فعال
                if TicketSession.objects.filter(
                    content_type=ct, object_id=object_id, status='open'
                ).exists():
                    raise serializers.ValidationError(
                        'سشن فعال برای این درخواست وجود دارد.')
            except (ContentType.DoesNotExist, model_class.DoesNotExist):
                raise serializers.ValidationError('درخواست نامعتبر است.')
        else:
            if content_type or object_id:
                raise serializers.ValidationError(
                    'سشن‌های عمومی نباید درخواست مرتبط داشته باشند.')
            # چک محدودیت ۵ سشن عمومی
            if TicketSession.objects.filter(user=user, session_type='general', status='open').count() >= 5:
                raise serializers.ValidationError(
                    'حداکثر ۵ سشن عمومی فعال می‌توانید داشته باشید.')

        return data

    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        content_type_name = validated_data.pop('content_type', None)
        content_type = None
        if content_type_name:
            content_type = ContentType.objects.get(
                model=content_type_name.lower())
        user = self.context['request'].user

        ticket = TicketSession.objects.create(
            user=user, content_type=content_type, **validated_data
        )

        if attachments_data:
            for attachment_data in attachments_data:
                attachment = Attachment.objects.create(
                    content_type=ContentType.objects.get_for_model(
                        TicketMessage),
                    object_id=None,  # بعداً به پیام وصل می‌شه
                    file=attachment_data['file'],
                    title=attachment_data.get('title', ''),
                    uploaded_by=user
                )
                # پیام اولیه با پیوست
                message = TicketMessage.objects.create(
                    ticket=ticket, sender=user, message='پیام اولیه با پیوست'
                )
                message.attachments.add(attachment)

        return ticket


class TicketMessageCreateSerializer(serializers.ModelSerializer):
    attachments = AttachmentCreateSerializer(many=True, required=False)

    class Meta:
        model = TicketMessage
        fields = ['message', 'attachments']

    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        user = self.context['request'].user
        ticket = self.context['ticket']

        message = TicketMessage.objects.create(
            ticket=ticket, sender=user, **validated_data
        )

        for attachment_data in attachments_data:
            attachment = Attachment.objects.create(
                content_type=ContentType.objects.get_for_model(TicketMessage),
                object_id=message.id,
                file=attachment_data['file'],
                title=attachment_data.get('title', ''),
                uploaded_by=user
            )
            message.attachments.add(attachment)

        ticket.last_message_by = 'user' if not user.is_staff else 'admin'
        ticket.reply_status = 'waiting_for_admin' if not user.is_staff else 'answered'
        ticket.updated_at = message.created_at
        ticket.save()

        return message
