from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib.contenttypes.models import ContentType
from .models import Referral
from tickets.models import TicketSession
from projects.models import Project
from core.models import AdminUser
from django.urls import reverse
from django.utils.html import format_html
from django.contrib.admin import SimpleListFilter

# فیلتر سفارشی برای پروژه


class ProjectFilter(SimpleListFilter):
    title = 'پروژه'
    parameter_name = 'project'

    def lookups(self, request, model_admin):
        projects = set()
        content_types = ContentType.objects.filter(
            model__in=[
                'surveyrequest',
                'supervisionrequest',
                'expertevaluationrequest',
                'executionrequest',
                'registrationrequest',
            ]
        )
        for ct in content_types:
            model_class = ct.model_class()
            project_ids = model_class.objects.select_related('project').values_list(
                'project__id', flat=True).distinct()
            projects.update(Project.objects.filter(id__in=project_ids))
        return [(project.id, project.title) for project in projects]

    def queryset(self, request, queryset):
        if self.value():
            content_types = ContentType.objects.filter(
                model__in=[
                    'surveyrequest',
                    'supervisionrequest',
                    'expertevaluationrequest',
                    'executionrequest',
                    'registrationrequest',
                ]
            )
            request_ids = []
            for ct in content_types:
                model_class = ct.model_class()
                ids = model_class.objects.filter(
                    project__id=self.value()
                ).values_list('id', flat=True)
                request_ids.extend(ids)
            return queryset.filter(object_id__in=request_ids)
        return queryset

# اینلاین برای نمایش تیکت‌های مرتبط


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = [
        'request_type',
        'project_title',
        'referrer_admin',
        'assigned_admin',
        'request_status',
        'description',
        'created_at',
        'ticket_count',
        'request_link',
    ]
    list_filter = [
        'content_type',
        'referrer_admin',
        'assigned_admin',
        ProjectFilter,
    ]
    search_fields = ['description']
    readonly_fields = ['content_type', 'object_id', 'referrer_admin',
                       'assigned_admin', 'description', 'created_at']
    list_per_page = 25
    date_hierarchy = 'created_at'

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related(
            'content_type', 'referrer_admin', 'assigned_admin'
        )
        if not request.user.is_superuser:
            qs = qs.filter(referrer_admin=request.user)
        return qs

    def request_type(self, obj):
        return obj.content_type.model.title()
    request_type.short_description = 'نوع درخواست'

    def project_title(self, obj):
        try:
            model_class = obj.content_type.model_class()
            request_obj = model_class.objects.select_related(
                'project').get(id=obj.object_id)
            project = request_obj.project
            return format_html(
                '<a href="{}">{}</a>',
                reverse('admin:projects_project_change', args=[project.id]),
                project.title
            )
        except (model_class.DoesNotExist, AttributeError):
            return '-'
    project_title.short_description = 'پروژه'

    def request_status(self, obj):
        try:
            model_class = obj.content_type.model_class()
            request_obj = model_class.objects.get(id=obj.object_id)
            return request_obj.status
        except (model_class.DoesNotExist, AttributeError):
            return '-'
    request_status.short_description = 'وضعیت درخواست'

    def ticket_count(self, obj):
        count = TicketSession.objects.filter(
            content_type=obj.content_type,
            object_id=obj.object_id
        ).count()
        return count
    ticket_count.short_description = 'تعداد تیکت‌ها'

    def request_link(self, obj):
        try:
            model_class = obj.content_type.model_class()
            request_obj = model_class.objects.get(id=obj.object_id)
            app_label = obj.content_type.app_label
            model_name = obj.content_type.model
            return format_html(
                '<a href="{}">{}</a>',
                reverse(f'admin:{app_label}_{model_name}_change',
                        args=[obj.object_id]),
                f"{model_class._meta.verbose_name} ({obj.object_id})"
            )
        except (model_class.DoesNotExist, AttributeError):
            return '-'
    request_link.short_description = 'درخواست'

    def has_add_permission(self, request):
        return False  # غیرفعال کردن امکان اضافه کردن ارجاع جدید

    def get_readonly_fields(self, request, obj=None):
        return ['content_type', 'object_id', 'referrer_admin', 'assigned_admin', 'description', 'created_at']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name in ['referrer_admin', 'assigned_admin']:
            kwargs['queryset'] = AdminUser.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def has_change_permission(self, request, obj=None):
        if obj and not request.user.is_superuser and obj.referrer_admin != request.user:
            return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if not request.user.is_superuser:
            return False
        return super().has_delete_permission(request, obj)
