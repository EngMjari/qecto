from rest_framework import serializers
from expert.models import ExpertEvaluationRequest
from projects.api.serializers import ProjectNestedSerializer
from projects.models import Project


class ExpertEvaluationRequestSerializer(serializers.ModelSerializer):
    project = ProjectNestedSerializer(read_only=True)
    attachments_count = serializers.IntegerField(
        source='attachments.count', read_only=True)

    class Meta:
        model = ExpertEvaluationRequest
        fields = [
            'id',
            'project',
            'area',
            'property_type',
            'main_parcel_number',
            'sub_parcel_number',
            'status',
            'location_lat',
            'location_lng',
            'description',
            'created_at',
            'attachments_count',
        ]


class ExpertEvaluationRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all())

    class Meta:
        model = ExpertEvaluationRequest
        fields = [
            'project',
            'area',
            'property_type',
            'main_parcel_number',
            'sub_parcel_number',
            'location_lat',
            'location_lng',
            'description',
            'status',
        ]
        read_only_fields = ['status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        user = request.user if request else None
        if user and not user.is_staff:
            self.fields['project'].queryset = user.projects.filter(
                expert_evaluation__isnull=True)
        else:
            from projects.models import Project
            self.fields['project'].queryset = Project.objects.filter(
                expert_evaluation__isnull=True)

    def validate_project(self, value):
        if ExpertEvaluationRequest.objects.filter(project=value).exists():
            raise serializers.ValidationError(
                "این پروژه قبلاً درخواست کارشناسی دارد.")
        return value

    def create(self, validated_data):
        validated_data['status'] = 'pending'
        return super().create(validated_data)
