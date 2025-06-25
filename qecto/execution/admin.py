from django.contrib import admin
from django import forms
from .models import ExecutionRequest
from attachments.models import Attachment
from django.contrib.contenttypes.admin import GenericTabularInline
from referrals.models import Referral
from django.contrib.contenttypes.models import ContentType
from core.models import AdminUser  # اضافه کردن ایمپورت
from django.template.response import TemplateResponse
from django.contrib import admin as django_admin  # برای ACTION_CHECKBOX_NAME

# فرم ارجاع


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


@admin.register(ExecutionRequest)
class ExecutionRequestAdmin(admin.ModelAdmin):
    list_display = (
        'project',
        'assigned_admin',
        'status',
        'building_area',
        'attachment_count',
        'referral_count',
        'created_at',
        'updated_at',
    )
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = (
        'project__title',
        'assigned_admin__full_name',
        'permit_number',
    )
    autocomplete_fields = ('project', 'assigned_admin')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [AttachmentInline]
    actions = ['refer_request']  # اضافه کردن اکشن

    fieldsets = (
        (None, {
            'fields': (
                'project',
                'assigned_admin',
                'status',
                'description',
                ('area', 'building_area'),
                'permit_number',
                ('location_lat', 'location_lng'),
                'property_type',
                'tracking_code',
                'created_at',
                'updated_at',
            )
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

    # متدهای جدید برای ارجاع
    def refer_request(self, request, queryset):
        # بررسی دسترسی کاربر
        if not request.user.is_superuser and not queryset.filter(assigned_admin=request.user).exists():
            self.message_user(
                request,
                "فقط سوپرادمین یا ادمین فعلی می‌تواند درخواست را ارجاع دهد.",
                level='error'
            )
            return

        # اگر فرم ارسال نشده، فرم را نمایش بده
        if 'admin_id' not in request.POST:
            return self.refer_request_form(request, queryset)

        # پردازش داده‌های فرم
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

        # ایجاد رکوردهای ارجاع
        content_type = ContentType.objects.get_for_model(ExecutionRequest)
        total_referred = 0

        for req in queryset:
            # ایجاد ارجاع جدید
            Referral.objects.create(
                content_type=content_type,
                object_id=req.id,
                referrer_admin=request.user,
                assigned_admin=assigned_admin,
                description=description
            )

            # به‌روزرسانی ادمین تخصیص یافته
            req.assigned_admin = assigned_admin
            req.save()
            total_referred += 1

        # نمایش پیام موفقیت
        self.message_user(
            request,
            f"{total_referred} درخواست اجرا با موفقیت به {assigned_admin} ارجاع داده شد.",
            level='success'
        )

    refer_request.short_description = "ارجاع درخواست به ادمین"

    def refer_request_form(self, request, queryset):
        # نمایش فرم سفارشی
        form = ReferRequestForm()
        return TemplateResponse(
            request,
            'admin/action_form.html',
            {
                'title': 'ارجاع درخواست‌های اجرا',
                'description': 'لطفاً ادمین مقصد و توضیحات ارجاع را مشخص کنید.',
                'form': form,
                'action': 'refer_request',
                'queryset': queryset,
                'opts': self.model._meta,
                'action_checkbox_name': django_admin.helpers.ACTION_CHECKBOX_NAME,
            }
        )

    def get_actions(self, request):
        # محدود کردن دسترسی به اکشن
        actions = super().get_actions(request)
        if not request.user.is_superuser and not ExecutionRequest.objects.filter(assigned_admin=request.user).exists():
            if 'refer_request' in actions:
                del actions['refer_request']
        return actions
