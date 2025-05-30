from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random
from .models import OTP
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from .permissions import IsSuperAdmin
from .serializers import AdminUserSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes

# یه دیکشنری ساده برای ذخیره OTP موقتی (فقط برای تست)
User = get_user_model()


class SendOTPView(APIView):
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


class AdminUserViewSet(ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        return User.objects.filter(is_staff=True, is_superuser=False)


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        image_url = None
        try:
            if user.profile_image:
                image_url = user.profile_image.url
        except Exception:
            image_url = None

        return Response({
            "full_name": user.full_name if hasattr(user, 'full_name') else user.get_full_name(),
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
            "phone": getattr(user, "phone", None),
            "image": image_url,
        })
