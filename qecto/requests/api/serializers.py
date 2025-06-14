from rest_framework import serializers
from attachments.api.serializers import AttachmentSerializer
from core.serializers import UserSerializer


# requests/serializers.py
class BaseRequestSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    tracking_code = serializers.CharField(read_only=True)  # اضافه شده
    request_type = serializers.CharField(read_only=True)
    project_title = serializers.CharField(
        source='project.title', read_only=True)
    owner = UserSerializer(source='project.owner', read_only=True)
    status = serializers.CharField()
    status_display = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    specific_fields = serializers.DictField(read_only=True)
    assigned_admin = UserSerializer(read_only=True)

    def get_status_display(self, obj):
        return dict(obj.STATUS_CHOICES).get(obj.status, obj.status)


class SupervisionRequestSerializer(BaseRequestSerializer):
    supervision_type = serializers.CharField()
    supervision_type_display = serializers.SerializerMethodField()

    def get_supervision_type_display(self, obj):
        return dict(obj.SUPERVISION_TYPE_CHOICES).get(obj.supervision_type, obj.supervision_type)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['request_type'] = 'supervision'
        data['specific_fields'] = {
            'supervision_type': instance.supervision_type,
            'supervision_type_display': self.get_supervision_type_display(instance),
            'area': instance.area,
            'building_area': instance.building_area,
            'permit_number': instance.permit_number,
            'description': instance.description,



        }
        return data


class SurveyRequestSerializer(BaseRequestSerializer):
    attachments_count = serializers.IntegerField(
        source='attachments.count', read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['request_type'] = 'survey'
        data['specific_fields'] = {
            'area': instance.area,
            'building_area': instance.building_area,
            'main_parcel_number': instance.main_parcel_number,
            'sub_parcel_number': instance.sub_parcel_number,
            'property_type': instance.property_type,
            'location_lat': instance.location_lat,
            'location_lng': instance.location_lng,
            'description': instance.description,
            'attachments_count': instance.attachments.count(),

        }
        return data


class ExpertEvaluationRequestSerializer(BaseRequestSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['request_type'] = 'expert'
        data['specific_fields'] = {
            'area': instance.area,
            'building_area': instance.building_area,
            'main_parcel_number': instance.main_parcel_number,
            'sub_parcel_number': instance.sub_parcel_number,
            'property_type': instance.property_type,
            'location_lat': instance.location_lat,
            'location_lng': instance.location_lng,
            'description': instance.description,

        }
        return data


class ExecutionRequestSerializer(BaseRequestSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['request_type'] = 'execution'
        data['specific_fields'] = {
            'area': instance.area,
            'building_area': instance.building_area,
            'property_type': instance.property_type,
            'location_lat': instance.location_lat,
            'location_lng': instance.location_lng,
            'description': instance.description,

        }
        return data


class RegistrationRequestSerializer(BaseRequestSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['request_type'] = 'registration'
        data['specific_fields'] = {
            'area': instance.area,
            'building_area': instance.building_area,
            'main_parcel_number': instance.main_parcel_number,
            'sub_parcel_number': instance.sub_parcel_number,
            'property_type': instance.property_type,
            'location_lat': instance.location_lat,
            'location_lng': instance.location_lng,
            'description': instance.description,

        }
        return data


class RequestStatsSerializer(serializers.Serializer):
    total_requests = serializers.IntegerField()
    status_counts = serializers.DictField(child=serializers.IntegerField())
    request_type_counts = serializers.DictField(
        child=serializers.IntegerField())
