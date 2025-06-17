# core/models.py :
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import random
from datetime import timedelta
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, phone, national_id, full_name, password=None, **extra_fields):
        if not phone:
            raise ValueError("شماره موبایل الزامی است")
        if not national_id:
            raise ValueError("کد ملی الزامی است")
        if not full_name:
            raise ValueError("نام و نام‌خانوادگی الزامی است")
        user = self.model(
            phone=phone,
            national_id=national_id,
            full_name=full_name,
            **extra_fields
        )
        user.set_password(password or self.make_random_password())
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, national_id, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, national_id, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    phone = models.CharField(max_length=11, unique=True)
    national_id = models.CharField(max_length=10, unique=True, null=True)
    full_name = models.CharField(max_length=100, name="full_name")
    email = models.EmailField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True, default='profile_images/default.png'
                                      )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['national_id', 'full_name']

    objects = UserManager()

    def __str__(self):
        return f'{self.full_name} ({self.phone})'

    class Meta:
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربر ها'


class OTP(models.Model):
    phone = models.CharField(max_length=11)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=2)

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))


class AdminUserManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(is_staff=True)


class AdminUser(User):
    objects = AdminUserManager()

    class Meta:
        proxy = True
        verbose_name = "ادمین"
        verbose_name_plural = "ادمین‌ها"


class SuperAdminUser(User):
    class Meta:
        proxy = True
        verbose_name = "سوپر ادمین"
        verbose_name_plural = "سوپر ادمین‌ها"
