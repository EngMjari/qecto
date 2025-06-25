from django.contrib import admin
from django import forms
from .models import SupervisionRequest
from attachments.models import Attachment
from django.contrib.contenttypes.admin import GenericTabularInline
from referrals.models import Referral
from django.contrib.contenttypes.models import ContentType
from core.models import AdminUser  # Import AdminUser
from django.template.response import TemplateResponse
# برای استفاده از ACTION_CHECKBOX_NAME
from django.contrib import admin as django_admin

# تعریف فرم ارجاع


class ReferRequestForm(forms.Form):
    admin_id = forms.ModelChoiceField(
        queryset=AdminUser.objects.all(),
        label="ارجاع به ادمین",
        required=True
    )
    description = forms.CharField(
        label="توضیحات ارجاع",
        required=False,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 40})
    )


class AttachmentInline(GenericTabularInline):
    model = Attachment
    extra = 1
    readonly_fields = ('uploaded_at', 'uploaded_by')
    fields = ('title', 'file', 'uploaded_at', 'uploaded_by')
    verbose_name = "پیوست"
    verbose_name_plural = "پیوست‌ها"


@admin.register(SupervisionRequest)
class SupervisionRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'project',
        'owner',
        'supervision_type',
        'status',
        'building_area',
        'permit_number',
        'attachment_count',
        'referral_count',
        'created_at',
    )
    list_filter = ('status', 'supervision_type', 'created_at')
    search_fields = ('project__title', 'owner__username', 'permit_number')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('project', 'owner', 'assigned_admin')
    ordering = ('-created_at',)
    inlines = [AttachmentInline]
    actions = ['refer_request']  # اضافه کردن اکشن

    fieldsets = (
        (None, {
            'fields': (
                'project', 'owner', 'assigned_admin', 'supervision_type', 'status',
                'description', 'permit_number', 'property_type', 'tracking_code',
            )
        }),
        ('مساحت', {
            'fields': ('area', 'building_area'),
        }),
        ('موقعیت جغرافیایی', {
            'fields': ('location_lat', 'location_lng'),
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def attachment_count(self, obj):
        return obj.attachments.count()
    attachment_count.short_description = 'تعداد پیوست‌ها'

    def referral_count(self, obj):
        return Referral.objects.filter(
            content_type=ContentType.objects.get_for_model(obj),
            object_id=obj.id
        ).count()
    referral_count.short_description = 'تعداد ارجاع‌ها'

    # متد‌های مربوط به ارجاع
    def refer_request(self, request, queryset):
        if not request.user.is_superuser and not queryset.filter(assigned_admin=request.user).exists():
            self.message_user(
                request, "فقط سوپرادمین یا ادمین فعلی می‌تواند درخواست را ارجاع دهد.", level='error')
            return

        if 'admin_id' not in request.POST:
            return self.refer_request_form(request, queryset)

        admin_id = request.POST.get('admin_id')
        description = request.POST.get('description', 'ارجاع درخواست به ادمین')

        if not admin_id:
            self.message_user(
                request, "لطفاً یک ادمین انتخاب کنید.", level='error')
            return

        try:
            assigned_admin = AdminUser.objects.get(id=admin_id)
        except AdminUser.DoesNotExist:
            self.message_user(
                request, "ادمین انتخاب‌شده یافت نشد.", level='error')
            return

        content_type = ContentType.objects.get_for_model(SupervisionRequest)
        total_referred = 0
        for req in queryset:
            Referral.objects.create(
                content_type=content_type,
                object_id=req.id,
                referrer_admin=request.user,
                assigned_admin=assigned_admin,
                description=description
            )
            req.assigned_admin = assigned_admin
            req.save()
            total_referred += 1

        self.message_user(
            request,
            f"{total_referred} درخواست با موفقیت به {assigned_admin} ارجاع داده شد.",
            level='success'
        )

    refer_request.short_description = "ارجاع درخواست به ادمین"

    def refer_request_form(self, request, queryset):
        form = ReferRequestForm()
        return TemplateResponse(
            request,
            'admin/action_form.html',
            {
                'title': 'ارجاع درخواست‌ها',
                'description': 'لطفاً ادمین مقصد و توضیحات ارجاع را مشخص کنید.',
                'form': form,
                'action': 'refer_request',
                'queryset': queryset,
                'opts': self.model._meta,
                'action_checkbox_name': django_admin.helpers.ACTION_CHECKBOX_NAME,
            }
        )

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not request.user.is_superuser and not SupervisionRequest.objects.filter(assigned_admin=request.user).exists():
            if 'refer_request' in actions:
                del actions['refer_request']
        return actions
