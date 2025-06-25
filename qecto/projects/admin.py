from django.contrib import admin
from django import forms
from .models import Project
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from django.utils.safestring import mark_safe
from referrals.models import Referral
from core.models import AdminUser
from tickets.models import TicketSession
from django.core.exceptions import ObjectDoesNotExist


class ReferProjectForm(forms.Form):
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


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_by', 'created_at',
                    'updated_at', 'total_requests', 'referral_count')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'owner__full_name', 'created_by__full_name')
    autocomplete_fields = ['owner', 'created_by']
    readonly_fields = ('created_at', 'updated_at', 'request_summary')
    actions = ['refer_project']

    fieldsets = (
        (None, {
            'fields': ('title', 'owner', 'created_by', 'description')
        }),
        ('زمان‌ها', {
            'fields': ('created_at', 'updated_at')
        }),
        ('درخواست‌ها', {
            'fields': ('request_summary',)
        }),
    )

    def total_requests(self, obj):
        return len(obj.all_requests())
    total_requests.short_description = 'تعداد درخواست‌ها'

    def referral_count(self, obj):
        content_types = ContentType.objects.filter(
            model__in=[
                'surveyrequest',
                'supervisionrequest',
                'expertevaluationrequest',
                'executionrequest',
                'registrationrequest',
            ]
        )
        count = 0
        for ct in content_types:
            try:
                model_class = ct.model_class()
                count += Referral.objects.filter(
                    content_type=ct,
                    object_id__in=model_class.objects.filter(
                        project=obj).values_list('id', flat=True)
                ).count()
            except Exception as e:
                self.message_user(
                    None, f"Error in referral_count for {ct.model}: {str(e)}", level='error')
        return count
    referral_count.short_description = 'تعداد ارجاع‌ها'

    def request_summary(self, obj):
        requests = obj.all_requests()
        if not requests:
            return "درخواستی ثبت نشده است."
        items = []
        for req in requests:
            try:
                model = req._meta.model_name
                app_label = req._meta.app_label
                url = reverse(
                    f"admin:{app_label}_{model}_change", args=[req.pk])
                label = f"{str(req)}"
                items.append(
                    f"<li><a href='{url}' target='_blank'>{label}</a></li>")
            except Exception as e:
                items.append(f"<li>Error: {str(e)}</li>")
        html = "<ul style='padding-right:20px'>" + "".join(items) + "</ul>"
        return mark_safe(html)
    request_summary.short_description = 'لیست درخواست‌ها'
    request_summary.allow_tags = True

    def refer_project(self, request, queryset):
        if not request.user.is_superuser:
            self.message_user(
                request, "فقط سوپرادمین می‌تواند پروژه را ارجاع دهد.", level='error')
            return

        if 'admin_id' not in request.POST:
            return self.refer_project_form(request, queryset)

        admin_id = request.POST.get('admin_id')
        description = request.POST.get('description', 'ارجاع پروژه به ادمین')

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

        total_referred = 0
        for project in queryset:
            self.message_user(
                request,
                f"Processing project: {project.title} (ID: {project.id})",
                level='info'
            )
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
                try:
                    model_class = ct.model_class()
                    if not model_class:
                        self.message_user(
                            request,
                            f"Model {ct.model} not found.",
                            level='error'
                        )
                        continue
                    requests = model_class.objects.filter(project=project)
                    self.message_user(
                        request,
                        f"Project {project.title}: Found {requests.count()} requests of type {ct.model}",
                        level='info'
                    )
                    for req in requests:
                        try:
                            Referral.objects.create(
                                content_type=ct,
                                object_id=req.id,
                                referrer_admin=request.user,
                                assigned_admin=assigned_admin,
                                description=description
                            )
                            req.assigned_admin = assigned_admin
                            req.save()
                            updated_tickets = TicketSession.objects.filter(
                                content_type=ct,
                                object_id=req.id
                            ).update(assigned_admin=assigned_admin)
                            self.message_user(
                                request,
                                f"Request {req.id} (type: {ct.model}) referred successfully, {updated_tickets} tickets updated.",
                                level='info'
                            )
                            total_referred += 1
                        except AttributeError as e:
                            self.message_user(
                                request,
                                f"Error referring request {req.id} (type: {ct.model}): {str(e)}",
                                level='error'
                            )
                        except Exception as e:
                            self.message_user(
                                request,
                                f"Unexpected error referring request {req.id} (type: {ct.model}): {str(e)}",
                                level='error'
                            )
                except Exception as e:
                    self.message_user(
                        request,
                        f"Error processing model {ct.model}: {str(e)}",
                        level='error'
                    )

        if total_referred > 0:
            self.message_user(
                request,
                f"{total_referred} requests from {queryset.count()} projects successfully referred to {assigned_admin}.",
                level='success'
            )
        else:
            self.message_user(
                request,
                "No requests were referred. Check if projects have associated requests.",
                level='warning'
            )

    refer_project.short_description = "ارجاع پروژه به ادمین"

    def refer_project_form(self, request, queryset):
        form = ReferProjectForm()
        from django.template.response import TemplateResponse
        return TemplateResponse(
            request,
            'admin/action_form.html',
            {
                'title': 'ارجاع پروژه‌ها',
                'description': 'لطفاً ادمین مقصد و توضیحات ارجاع را مشخص کنید.',
                'form': form,
                'action': 'refer_project',
                'queryset': queryset,
                'opts': self.model._meta,
                'action_checkbox_name': admin.helpers.ACTION_CHECKBOX_NAME,
            }
        )

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not request.user.is_superuser:
            del actions['refer_project']
        return actions
