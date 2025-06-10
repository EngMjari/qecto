# siteconfig/api.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import SiteConfig
from .serializers import SiteConfigSerializer
from .utils import get_site_config


class IsSuperAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow GET for all users
        if request.method in permissions.SAFE_METHODS:
            return True
        # Allow others only if user is superuser
        return request.user and request.user.is_superuser


class SiteConfigAPIView(APIView):
    permission_classes = [IsSuperAdminOrReadOnly]

    def get(self, request):
        config = get_site_config()
        serializer = SiteConfigSerializer(config)
        return Response(serializer.data)

    def post(self, request):
        if SiteConfig.objects.exists():
            return Response({"detail": "Site configuration already exists."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SiteConfigSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        config = get_site_config()
        serializer = SiteConfigSerializer(
            config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
