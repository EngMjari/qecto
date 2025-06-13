from rest_framework import serializers
from supervision.models import SupervisionRequest
from projects.models import Project
from attachments.models import Attachment
from django.contrib.auth import get_user_model
from projects.api.serializers import ProjectSerializer

User = get_user_model()


class SupervisionRequestCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=False, allow_null=True
    )
    project_name = serializers.CharField(
        max_length=200, required=False, allow_blank=True)
    attachments = serializers.ListField(
        child=serializers.FileField(), required=False, write_only=True)
    titles = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True)
    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False
    )

    class Meta:
        model = SupervisionRequest
        fields = [
            'project', 'project_name', 'owner', 'supervision_type', 'description',
            'area', 'building_area', 'permit_number', 'location_lat', 'location_lng',
            'attachments', 'titles'
        ]

    def validate(self, data):
        project = data.get('project')
        project_name = data.get('project_name')
        supervision_type = data.get('supervision_type')
        attachments = data.get('attachments', [])
        titles = data.get('titles', [])
        building_area = data.get('building_area')

        if not project and not project_name:
            raise serializers.ValidationError(
                "project or project_name is required.")
        if project and project_name:
            raise serializers.ValidationError(
                "Cannot provide both project and project_name.")

        if project and supervision_type == 'architecture':
            if SupervisionRequest.objects.filter(
                project=project, supervision_type='architecture'
            ).exists():
                raise serializers.ValidationError(
                    "برای این پروژه قبلاً درخواست نظارت معماری ثبت شده است."
                )

        if building_area is None or building_area <= 0:
            raise serializers.ValidationError(
                "مساحت بنا اجباری است و باید بیشتر از صفر باشد.")

        if attachments:
            if not titles or len(titles) != len(attachments):
                raise serializers.ValidationError(
                    "هر پیوست باید یک عنوان داشته باشد.")

        return data

    def create(self, validated_data):
        user = request.user
        project = validated_data.pop('project', None)
        project_name = validated_data.pop('project_name', None)
        attachments = validated_data.pop('attachments', [])
        titles = validated_data.pop('titles', [])
        owner = validated_data.pop('owner', None)

        request = self.context.get('request')
        if owner is None or not request.user.is_staff:
            owner = request.user
        validated_data['status'] = 'pending'
        validated_data['owner'] = user
        if project_name and not project:
            project = Project.objects.create(
                title=project_name,
                owner=owner,
                created_by=request.user
            )

        supervision_request = SupervisionRequest.objects.create(
            project=project,
            owner=owner,
            **validated_data
        )

        for file, title in zip(attachments, titles):
            Attachment.objects.create(
                content_object=supervision_request,
                file=file,
                title=title
            )

        return supervision_request


class SupervisionRequestSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    owner = serializers.StringRelatedField(read_only=True)
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = SupervisionRequest
        fields = [
            'id', 'project', 'owner', 'supervision_type', 'description',
            'area', 'building_area', 'permit_number', 'location_lat', 'location_lng',
            'status', 'created_at', 'updated_at', 'attachments'
        ]

    def get_attachments(self, obj):
        try:
            attachments = obj.attachments.all()
            return [{'file': att.file.url, 'title': att.title} for att in attachments]
        except Exception as e:
            print(f"Error in get_attachments: {str(e)}")
            return []
