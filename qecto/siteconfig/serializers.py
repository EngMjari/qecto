# siteconfig/serializers.py

from rest_framework import serializers
from .models import SiteConfig


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
