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
        fields = ['id', 'full_name', 'phone', 'profile_image']


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone', 'national_id', 'full_name',
                  'email', 'profile_image', 'is_active']
        read_only_fields = ['id']

    def create(self, validated_data):
        # ادمین جدید بساز
        user = User.objects.create_user(
            phone=validated_data['phone'],
            national_id=validated_data['national_id'],
            full_name=validated_data['full_name'],
            email=validated_data.get('email'),
        )
        user.is_staff = True
        user.save()
        return user
