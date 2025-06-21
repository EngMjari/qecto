from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import User, AdminUser, SuperAdminUser


# فرم ایجاد کاربر اصلی (User)
class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='رمز عبور', widget=forms.PasswordInput)
    password2 = forms.CharField(
        label='تأیید رمز عبور', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('phone', 'national_id', 'full_name')

    def clean_password2(self):
        pw1 = self.cleaned_data.get('password1')
        pw2 = self.cleaned_data.get('password2')
        if pw1 and pw2 and pw1 != pw2:
            raise forms.ValidationError("رمزهای عبور مطابقت ندارند")
        return pw2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


# فرم تغییر کاربر اصلی (User)
class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(label=("رمز عبور"))

    class Meta:
        model = User
        fields = ('phone', 'national_id', 'full_name', 'email', 'whatsapp', 'telegram', 'password',
                  'is_active', 'is_staff', 'is_superuser')

    def clean_password(self):
        return self.initial["password"]


# فرم ایجاد ادمین (AdminUser)
class AdminUserCreationForm(UserCreationForm):
    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_staff = True
        user.is_superuser = False
        if commit:
            user.save()
        return user


# فرم تغییر ادمین (AdminUser)
class AdminUserChangeForm(UserChangeForm):
    pass


# فرم ایجاد سوپرادمین (SuperAdminUser)
class SuperAdminUserCreationForm(UserCreationForm):
    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_staff = True
        user.is_superuser = True
        if commit:
            user.save()
        return user


# فرم تغییر سوپرادمین (SuperAdminUser)
class SuperAdminUserChangeForm(UserChangeForm):
    pass


# کلاس AdminUserAdmin
@admin.register(AdminUser)
class AdminUserAdmin(BaseUserAdmin):
    add_form = AdminUserCreationForm
    form = AdminUserChangeForm
    model = AdminUser

    list_display = ('phone', 'full_name', 'is_active',
                    'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('is_active',)
    ordering = ('phone',)
    search_fields = ('phone', 'full_name', 'national_id')

    fieldsets = (
        (None, {'fields': ('phone', 'full_name', 'national_id', 'password')}),
        ('دسترسی‌ها', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'national_id', 'full_name', 'password1', 'password2'),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(is_staff=True, is_superuser=False)


# کلاس SuperAdminUserAdmin
@admin.register(SuperAdminUser)
class SuperAdminUserAdmin(BaseUserAdmin):
    add_form = SuperAdminUserCreationForm
    form = SuperAdminUserChangeForm
    model = SuperAdminUser

    list_display = ('phone', 'full_name', 'is_active',
                    'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('is_active',)
    ordering = ('phone',)
    search_fields = ('phone', 'full_name', 'national_id')

    fieldsets = (
        (None, {'fields': ('phone', 'full_name', 'national_id', 'password')}),
        ('دسترسی‌ها', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'national_id', 'full_name', 'password1', 'password2'),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(is_superuser=True)


# کلاس UserAdmin (کاربران عادی)
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    model = User

    list_display = ('phone', 'full_name', 'is_active',
                    'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    ordering = ('phone',)
    search_fields = ('phone', 'full_name', 'national_id')

    fieldsets = (
        (None, {'fields': ('phone', 'full_name', 'national_id', 'password')}),
        ('دسترسی‌ها', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'national_id', 'full_name', 'password1', 'password2'),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(is_staff=False, is_superuser=False)
