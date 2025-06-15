from django.contrib import admin
from django.contrib.contenttypes.admin import GenericStackedInline
from .models import TicketSession, TicketMessage


class TicketMessageInline(admin.TabularInline):
    model = TicketMessage
    extra = 1
    readonly_fields = ['created_at', 'sender_display']
    can_delete = False

    def has_add_permission(self, request, obj):
        return False

    def sender_display(self, obj):
        return obj.sender.get_username() if obj.sender else "-"
    sender_display.short_description = "فرستنده"


@admin.register(TicketSession)
class TicketSessionAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'session_type', 'user', 'assigned_admin',
        'status', 'reply_status', 'content_object_display', 'created_at'
    ]
    list_filter = ['session_type', 'status', 'reply_status', 'created_at']
    search_fields = ['title', 'user__username', 'assigned_admin__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [TicketMessageInline]
    autocomplete_fields = ['user', 'assigned_admin']

    fieldsets = (
        (None, {
            'fields': (
                'title', 'session_type', 'user', 'assigned_admin',
                'status', 'reply_status', 'last_message_by', 'closed_reason'
            )
        }),
        ('ارتباط با درخواست', {
            'fields': ('content_type', 'object_id')
        }),
        ('تاریخ', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def content_object_display(self, obj):
        return str(obj.related_request) if obj.related_request else '-'
    content_object_display.short_description = "درخواست مرتبط"


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticket', 'sender_display', 'created_at']
    search_fields = ['message', 'ticket__title',
                     'sender_user__username', 'sender_admin__username']
    readonly_fields = ['created_at', 'sender_display']
    autocomplete_fields = ['ticket']

    def sender_display(self, obj):
        return obj.sender.get_username() if obj.sender else "-"
    sender_display.short_description = "فرستنده"
