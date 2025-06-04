from rest_framework import serializers
from .models import Ticket, TicketReply, TicketAttachment, TicketReplyAttachment
from projects.models import Project
from expert.models import ExpertEvaluationProject
from survey.models import SurveyProject

class TicketAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketAttachment
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class TicketReplyAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketReplyAttachment
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class TicketReplySerializer(serializers.ModelSerializer):
    attachments = TicketReplyAttachmentSerializer(many=True, read_only=True)
    uploaded_files = serializers.ListField(
        child=serializers.FileField(), write_only=True, required=False
    )

    class Meta:
        model = TicketReply
        fields = [
            'id',
            'ticket',
            'message',
            'replied_by',
            'created_at',
            'attachments',
            'uploaded_files',  # اضافه‌شده
        ]
        read_only_fields = ['id', 'replied_by', 'created_at', 'attachments']

    def create(self, validated_data):
        user = self.context['request'].user
        ticket = validated_data['ticket']
        files = validated_data.pop('uploaded_files', [])

        if ticket.status == 'closed':
            raise serializers.ValidationError("نمی‌توان به تیکت بسته شده پاسخ داد.")

        reply = TicketReply.objects.create(
            ticket=ticket,
            message=validated_data['message'],
            replied_by=user
        )

        # ایجاد فایل‌های پیوست برای پاسخ
        for f in files:
            TicketReplyAttachment.objects.create(
                reply=reply,
                file=f,
                uploaded_by=user
            )

        # اگر ادمین یا سوپرادمین پاسخ دهد، وضعیت تیکت تغییر می‌کند
        if user.is_staff or user.is_superuser:
            ticket.status = 'answered'
            ticket.save()

        return reply

class TicketSerializer(serializers.ModelSerializer):
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    replies = TicketReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id',
            'title',
            'description',
            'created_by',
            'related_project',
            'related_survey',
            'related_expert',
            'subject_type',
            'status',
            'created_at',
            'assigned_admin',
            'attachments',
            'replies'
        ]
        read_only_fields = ['id', 'created_by', 'status', 'created_at', 'assigned_admin', 'attachments', 'replies']

    def validate(self, attrs):
        user = self.context['request'].user
        related_project = attrs.get('related_project')

        # جلوگیری از ایجاد session جدید در صورت باز بودن session قبلی
        if related_project:
            open_tickets = Ticket.objects.filter(
                created_by=user,
                related_project=related_project,
                status__in=['open', 'answered']
            )
            if open_tickets.exists():
                raise serializers.ValidationError("برای این پروژه یک session باز وجود دارد. ابتدا آن را ببندید.")

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['status'] = 'open'

        # ارجاع خودکار به ادمین پروژه
        assigned_admin = None
        project = validated_data.get('related_project')
        if project and hasattr(project, 'admin') and project.admin:
            assigned_admin = project.admin
        validated_data['assigned_admin'] = assigned_admin

        return super().create(validated_data)
