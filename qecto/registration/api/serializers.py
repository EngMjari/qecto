# registration/api/serializers.py
from rest_framework import serializers
from registration.models import RegistrationRequest
from projects.api.serializers import ProjectNestedSerializer
from projects.models import Project


class RegistrationRequestSerializer(serializers.ModelSerializer):
    project = ProjectNestedSerializer(read_only=True)
    attachments_count = serializers.IntegerField(
        source='attachments.count', read_only=True)

    class Meta:
        model = RegistrationRequest
        fields = [
            'id',
            'project',
            'property_type',
            'ownership_status',
            'area',
            'building_area',
            'location_lat',
            'location_lng',
            'description',
            'status',
            'created_at',
            'attachments_count',
        ]


class RegistrationRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all())

    class Meta:
        model = RegistrationRequest
        fields = [
            'project',
            'property_type',
            'ownership_status',
            'area',
            'building_area',
            'location_lat',
            'location_lng',
            'description',
            'status',
        ]
        read_only_fields = ['status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from projects.models import Project

        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if user and not user.is_staff:
            self.fields['project'].queryset = Project.objects.filter(
                owner=user)
        else:
            self.fields['project'].queryset = Project.objects.all()

    def validate(self, attrs):
        property_type = attrs.get('property_type')
        building_area = attrs.get('building_area')

        # اگر نوع ملک ساختمان نیست، نباید مساحت بنا وارد شده باشد
        if property_type != 'building' and building_area:
            raise serializers.ValidationError(
                "فیلد 'مساحت بنا' فقط زمانی وارد شود که نوع ملک 'ساختمان' باشد."
            )
        return attrs

    def create(self, validated_data):
        validated_data['status'] = 'pending'
        return super().create(validated_data)
