from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Permission
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('phone', 'full_name', 'national_id',
                    'is_staff', 'is_superuser')
    search_fields = ('phone', 'full_name', 'national_id')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('اطلاعات شخصی', {'fields': ('full_name',
         'national_id', 'email', 'profile_image')}),
        ('دسترسی‌ها', {'fields': ('is_active', 'is_staff',
         'is_superuser', 'groups', 'user_permissions')}),
        ('تاریخ‌ها', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'full_name', 'national_id', 'password1', 'password2'),
        }),
    )


# لازم است Permission هم در ادمین رجیستر شود چون از آن در autocomplete استفاده شده:
admin.site.register(Permission)
