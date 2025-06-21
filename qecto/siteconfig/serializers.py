# siteconfig/serializers.py

from rest_framework import serializers
from .models import HomePage, AboutUs, ContactUs, Services, SiteConfig
from core.models import User  # برای گرفتن تعداد کاربران
from core.serializers import AdminUserSerializer
from tickets.models import TicketSession  # برای گرفتن تعداد تیکت‌ها
from survey.models import SurveyRequest
from supervision.models import SupervisionRequest
from expert.models import ExpertEvaluationRequest
from execution.models import ExecutionRequest
from registration.models import RegistrationRequest
from django.db.models import Count
import json


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


class ServicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Services
        fields = ['title', 'description', 'icon']


class HomePageSerializer(serializers.ModelSerializer):
    header_image_url = serializers.SerializerMethodField()
    request_bgImage_url = serializers.SerializerMethodField()
    services = ServicesSerializer(many=True)
    user = serializers.SerializerMethodField()
    tickets = serializers.SerializerMethodField()
    complete_requests = serializers.SerializerMethodField()

    class Meta:
        model = HomePage
        fields = [
            'header_title', 'header_description', 'header_image_url',
            'our_projects_title', 'our_projects_description',
            'complete_requests', 'user', 'tickets',
            'services_title', 'services', 'services_description',
            'request_title', 'request_description', 'request_bgColor', 'request_bgImage_url'
        ]

    def get_header_image_url(self, obj):
        request = self.context.get('request')
        if obj.header_image and request:
            return request.build_absolute_uri(obj.header_image.url)
        elif obj.header_image:
            return obj.header_image.url
        return None

    def get_request_bgImage_url(self, obj):
        request = self.context.get('request')
        if obj.request_bgImage and request:
            return request.build_absolute_uri(obj.request_bgImage.url)
        elif obj.request_bgImage:
            return obj.request_bgImage.url
        return None

    def get_user(self, obj):
        # تعداد کاربران فعال از مدل User
        return User.objects.filter(is_active=True).count()

    def get_tickets(self, obj):
        # تعداد تیکت‌ها از مدل TicketSession
        return TicketSession.objects.count()

    def get_complete_requests(self, obj):
        # تعداد درخواست‌های تکمیل‌شده از همه مدل‌های درخواست
        request_models = [
            SurveyRequest, SupervisionRequest, ExpertEvaluationRequest,
            ExecutionRequest, RegistrationRequest
        ]
        total_completed = 0
        for model in request_models:
            total_completed += model.objects.count()
        return total_completed

    def to_internal_value(self, data):
        # تبدیل JSON سریالایز شده به لیست برای services
        if 'services' in data and isinstance(data['services'], str):
            data['services'] = json.loads(data['services'])
        return super().to_internal_value(data)


class AboutUsSerializer(serializers.ModelSerializer):
    header_image_url = serializers.SerializerMethodField()
    our_story_image_url = serializers.SerializerMethodField()
    our_team_member = AdminUserSerializer(many=True)

    class Meta:
        model = AboutUs
        fields = [
            'header_title', 'header_description', 'header_image_url',
            'our_story', 'our_story_image_url',
            'our_team_title', 'our_team_description', 'our_team_member'
        ]

    def get_header_image_url(self, obj):
        request = self.context.get('request')
        if obj.header_image and request:
            return request.build_absolute_uri(obj.header_image.url)
        elif obj.header_image:
            return obj.header_image.url
        return None

    def get_our_story_image_url(self, obj):
        request = self.context.get('request')
        if obj.our_story_image and request:
            return request.build_absolute_uri(obj.our_story_image.url)
        elif obj.our_story_image:
            return obj.our_story_image.url
        return None

    def to_internal_value(self, data):
        # تبدیل JSON سریالایز شده به لیست برای our_team_member
        if 'our_team_member' in data and isinstance(data['our_team_member'], str):
            data['our_team_member'] = json.loads(data['our_team_member'])
        return super().to_internal_value(data)


class ContactUsSerializer(serializers.ModelSerializer):
    header_image_url = serializers.SerializerMethodField()

    class Meta:
        model = ContactUs
        fields = [
            'header_title', 'header_description', 'header_image_url',
            'ai_title', 'ai_descriptions', 'ai_placeholder',
            'ai_text', 'ai_request_text', 'contact_time'
        ]

    def get_header_image_url(self, obj):
        request = self.context.get('request')
        if obj.header_image and request:
            return request.build_absolute_uri(obj.header_image.url)
        elif obj.header_image:
            return obj.header_image.url
        return None
