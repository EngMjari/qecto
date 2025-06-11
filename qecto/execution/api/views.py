# execution/api/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from projects.models import Project
from execution.models import ExecutionRequest
from execution.api.serializers import ExecutionRequestSerializer


class ExecutionRequestViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def list(self, request):
        user = request.user
        queryset = ExecutionRequest.objects.filter(project__owner=user)
        serializer = ExecutionRequestSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        user = request.user
        instance = get_object_or_404(
            ExecutionRequest, pk=pk, project__owner=user)
        serializer = ExecutionRequestSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):
        user = request.user
        data = request.data

        project_id = data.get("project")
        project_name = data.get("project_name")

        location = data.get("location")
        if not location:
            return Response({"detail": "location is required."}, status=status.HTTP_400_BAD_REQUEST)

        description = data.get("description", "")
        status_field = data.get("status", "pending")

        if project_id:
            try:
                project = Project.objects.get(id=project_id, owner=user)
            except Project.DoesNotExist:
                return Response({"detail": "Project not found or not owned by user."}, status=status.HTTP_404_NOT_FOUND)
        else:
            if not project_name:
                return Response({"detail": "project_name is required when no project selected."}, status=status.HTTP_400_BAD_REQUEST)
            project = Project.objects.create(name=project_name, owner=user)

        execution_request = ExecutionRequest.objects.create(
            project=project,
            location=location,
            description=description,
            status=status_field,
            assigned_admin=None,
        )

        files = request.FILES.getlist('files')
        for f in files:
            execution_request.files.create(file=f)

        serializer = ExecutionRequestSerializer(execution_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
