# siteconfig/api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from siteconfig.models import SiteConfig
from siteconfig.serializers import SiteConfigSerializer


class SiteConfigAPIView(APIView):
    # یا اگه دوست داشتی می‌تونی تغییر بدی
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        config, _ = SiteConfig.objects.get_or_create(id=1)
        serializer = SiteConfigSerializer(config)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        if not request.user.is_superuser:
            return Response(
                {"detail": "شما اجازه ویرایش تنظیمات سایت را ندارید."},
                status=status.HTTP_403_FORBIDDEN
            )

        config, _ = SiteConfig.objects.get_or_create(id=1)
        serializer = SiteConfigSerializer(
            config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
