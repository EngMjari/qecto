from rest_framework import serializers
from .models import OTP, User


class PhoneSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)


class OTPVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    code = serializers.CharField(max_length=6)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'phone',
                  'profile_image', 'is_staff', 'role']


class AdminUserSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'phone', 'national_id', 'full_name', 'email',
            'whatsapp', 'telegram', 'image_url', 'is_active',
            'role', 'role_display'
        ]
        read_only_fields = ['id', 'is_active', 'role_display']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.profile_image and request:
            return request.build_absolute_uri(obj.profile_image.url)
        elif obj.profile_image:
            return obj.profile_image.url
        return None

    def get_role_display(self, obj):
        return obj.get_role_display() or "بدون نقش"

    def create(self, validated_data):
        # ادمین جدید بساز
        user = User.objects.create_user(
            phone=validated_data['phone'],
            national_id=validated_data['national_id'],
            full_name=validated_data['full_name'],
            email=validated_data.get('email'),
            role=validated_data.get('role'),
            whatsapp=validated_data.get('whatsapp'),
            telegram=validated_data.get('telegram')
        )
        user.is_staff = True
        user.save()
        return user

    def update(self, instance, validated_data):
        # به‌روزرسانی ادمین
        instance.phone = validated_data.get('phone', instance.phone)
        instance.national_id = validated_data.get(
            'national_id', instance.national_id)
        instance.full_name = validated_data.get(
            'full_name', instance.full_name)
        instance.email = validated_data.get('email', instance.email)
        instance.whatsapp = validated_data.get('whatsapp', instance.whatsapp)
        instance.telegram = validated_data.get('telegram', instance.telegram)
        instance.role = validated_data.get('role', instance.role)
        if 'profile_image' in validated_data:
            instance.profile_image = validated_data['profile_image']
        instance.save()
        return instance
