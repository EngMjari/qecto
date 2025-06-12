from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
import random
from .models import OTP

# یه دیکشنری ساده برای ذخیره OTP موقتی (فقط برای تست)
User = get_user_model()


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        if not phone:
            return Response({"detail": "شماره تلفن وارد نشده است."}, status=status.HTTP_400_BAD_REQUEST)

        # حذف همه رکوردهای قبلی این شماره
        OTP.objects.filter(phone=phone).delete()

        # تولید کد 6 رقمی
        code = str(random.randint(100000, 999999))

        # ذخیره در دیتابیس
        OTP.objects.create(phone=phone, code=code, created_at=timezone.now())

        # اینجا می‌تونی ارسال پیامک واقعی انجام بدی
        print(f"کد تایید برای {phone}: {code}")  # برای تست

        return Response({"detail": "کد تایید ارسال شد."}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        code = request.data.get("otp")

        try:
            otp_record = OTP.objects.get(phone=phone)
        except OTP.DoesNotExist:
            return Response({"error": "کدی برای این شماره ارسال نشده است."}, status=400)

        if otp_record.code != code:
            return Response({"error": "کد وارد شده اشتباه است."}, status=400)

        if otp_record.is_expired():
            return Response({"error": "کد منقضی شده است."}, status=400)

        user, _ = User.objects.get_or_create(phone=phone)
        refresh = RefreshToken.for_user(user)

        # حذف کد پس از تأیید موفق
        otp_record.delete()

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class UserInfoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # ساختن URL کامل تصویر پروفایل
        if user.profile_image:
            image_url = request.build_absolute_uri(user.profile_image.url)
        else:
            # تصویر پیش‌فرض اگر نبود
            image_url = request.build_absolute_uri(
                '/media/profile_images/default.png')

        data = {
            "id": user.id,
            "phone": user.phone,
            "national_id": user.national_id,
            "full_name": user.full_name,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "image": image_url,
        }
        return Response(data)
