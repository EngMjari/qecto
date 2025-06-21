# qecto/projects/api/views.py
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from projects.models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        try:
            projects = Project.objects.select_related(
                'owner', 'created_by').all()
            serializer = self.get_serializer(projects, many=True)
            return Response(serializer.data)
        except Exception as e:
            raise
