from rest_framework import serializers
from .models import TicketSession, TicketMessage, TicketMessageFile
from survey.api.serializers import SurveyProjectSerializer
from expert.api.serializers import ExpertEvaluationProjectSerializer


class TicketMessageFileSerializer(serializers.ModelSerializer):
    file_extension = serializers.SerializerMethodField()
    readable_file_size = serializers.SerializerMethodField()

    class Meta:
        model = TicketMessageFile
        fields = ['id', 'file', 'uploaded_at', 'file_extension',
                  'file_size', 'custom_name', 'readable_file_size']
        read_only_fields = ['id', 'uploaded_at', 'file_extension',
                            'file_size', 'custom_name', 'readable_file_size']

    def get_file_extension(self, obj):
        return obj.file_extension()

    def get_readable_file_size(self, obj):
        return obj.readable_file_size()


class SessionSerializer(serializers.ModelSerializer):
    user_phone = serializers.SerializerMethodField()
    assigned_admin_phone = serializers.SerializerMethodField()

    # اضافه کن این خط را برای پنهان کردن فیلد user از ورودی کلاینت
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TicketSession
        fields = [
            'id', 'title', 'session_type', 'survey_request', 'evaluation_request',
            'user', 'user_phone', 'assigned_admin', 'assigned_admin_phone',
            'status', 'reply_status', 'last_message_by', 'closed_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at',
                            'messages', 'user_phone', 'assigned_admin_phone', 'user']

    def get_user_phone(self, obj):
        if obj.user:
            return getattr(obj.user, 'phone_number', str(obj.user))
        return None

    def get_assigned_admin_phone(self, obj):
        if obj.assigned_admin:
            return getattr(obj.assigned_admin, 'phone_number', str(obj.assigned_admin))
        return None


class TicketMessageSerializer(serializers.ModelSerializer):
    files = TicketMessageFileSerializer(many=True, read_only=True)
    sender_phone = serializers.SerializerMethodField()
    # برای جلوگیری از حلقه‌ی تو در تو
    session = SessionSerializer(read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'session', 'sender_user', 'sender_admin',
                  'sender_phone', 'content', 'created_at', 'files']
        read_only_fields = ['id', 'created_at',
                            'sender_phone', 'sender_user', 'sender_admin']

    def get_sender_phone(self, obj):
        if obj.sender_user:
            return getattr(obj.sender_user, 'phone_number', str(obj.sender_user))
        elif obj.sender_admin:
            return getattr(obj.sender_admin, 'phone_number', str(obj.sender_admin))
        return "مهمان"


class TicketSessionSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_phone = serializers.SerializerMethodField()
    assigned_admin_phone = serializers.SerializerMethodField()
    survey_request = SurveyProjectSerializer()
    evaluation_request = ExpertEvaluationProjectSerializer()
    # اضافه کن این خط را برای پنهان کردن فیلد user از ورودی کلاینت
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TicketSession
        fields = [
            'id', 'title', 'session_type', 'survey_request', 'evaluation_request',
            'user', 'user_phone', 'assigned_admin', 'assigned_admin_phone',
            'status', 'reply_status', 'last_message_by', 'closed_reason',
            'created_at', 'updated_at', 'messages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at',
                            'messages', 'user_phone', 'assigned_admin_phone', 'user']

    def get_user_phone(self, obj):
        if obj.user:
            return getattr(obj.user, 'phone_number', str(obj.user))
        return None

    def get_assigned_admin_phone(self, obj):
        if obj.assigned_admin:
            return getattr(obj.assigned_admin, 'phone_number', str(obj.assigned_admin))
        return None
