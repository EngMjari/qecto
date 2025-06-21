# siteconfig/serializers.py

from rest_framework import serializers
from .models import SiteConfig, HomePage


class SiteConfigSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteConfig
        fields = [
            'site_name',
            'description',
            'phone',
            'email',
            'address',
            'primary_color',
            'secondary_color',
            'logo_url',
            'favicon_url',
        ]

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        elif obj.logo:
            return obj.logo.url
        return None

    def get_favicon_url(self, obj):
        request = self.context.get('request')
        if obj.favicon and request:
            return request.build_absolute_uri(obj.favicon.url)
        elif obj.favicon:
            return obj.favicon.url
        return None


class HomePageSerializer(serializers.ModelSerializer):
    bgImage_url = serializers.SerializerMethodField()
    bgRequest_url = serializers.SerializerMethodField()

    class Meta:
        model = HomePage
        fields = [
            'header_title',
            'header_description',
            'our_projects_title',
            'our_projects_description',
            'complete_requests',
            'user',
            'tickets',
            'services_title',
            'services',
            'services_description',
            'request_title',
            'request_description',
            'request_bgColor',
            'bgImage_url',
            'bgRequest_url',
        ]

    def get_bgImage_url(self, obj):
        request = self.context.get('request')
        if obj.header_image and request:
            return request.build_absolute_uri(obj.header_image.url)
        elif obj.header_image:
            return obj.header_image.url
        return None

    def get_bgRequest_url(self, obj):
        request = self.context.get('request')
        if obj.request_bgImage and request:
            return request.build_absolute_uri(obj.request_bgImage.url)
        elif obj.request_bgImage:
            return obj.request_bgImage.url
        return None
