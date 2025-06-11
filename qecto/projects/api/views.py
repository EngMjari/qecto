from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models

from projects.models import Project
from projects.api.serializers import ProjectSerializer
from expert.api.serializers import ExpertEvaluationRequestSerializer
from supervision.api.serializers import SupervisionRequestSerializer
from execution.api.serializers import ExecutionRequestSerializer
from registration.api.serializers import RegistrationRequestSerializer


class ProjectsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user

        if user.is_superuser:
            projects = Project.objects.all()

        elif user.is_staff:
            projects = Project.objects.filter(
                models.Q(supervision_requests__assigned_admin=user) |
                models.Q(execution_requests__assigned_admin=user)
            ).distinct()

        else:
            projects = Project.objects.filter(owner=user)

        projects = projects.prefetch_related(
            'supervision_requests',
            'execution_requests',
        ).select_related('registration_request')

        result = []
        for project in projects:
            data = ProjectSerializer(project).data

            expert = getattr(project, 'expert_evaluation', None)
            expert_data = ExpertEvaluationRequestSerializer(
                expert).data if expert else None

            supervision = project.supervision_requests.all()
            supervision_data = SupervisionRequestSerializer(
                supervision, many=True).data

            execution = project.execution_requests.all()
            execution_data = ExecutionRequestSerializer(
                execution, many=True).data

            registration = getattr(project, 'registration_request', None)
            registration_data = RegistrationRequestSerializer(
                registration).data if registration else None

            data['requests'] = {
                'expert_evaluation': expert_data,
                'supervision': supervision_data,
                'execution': execution_data,
                'registration': registration_data,
            }
            result.append(data)

        return Response(result, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        user = request.user
        project = get_object_or_404(Project, pk=pk)

        # چک کردن دسترسی کاربر به پروژه مشابه list
        has_access = False

        if user.is_superuser:
            has_access = True
        elif user.is_staff:
            # ادمین فقط اگر درخواستی بهش ارجاع شده باشه اجازه داره
            if project.supervision_requests.filter(assigned_admin=user).exists() or \
               project.execution_requests.filter(assigned_admin=user).exists():
                has_access = True
        else:
            # کاربر عادی فقط اگر صاحب پروژه باشد
            if project.owner == user:
                has_access = True

        if not has_access:
            return Response(
                {"detail": "شما اجازه دسترسی به این پروژه را ندارید."},
                status=status.HTTP_403_FORBIDDEN
            )

        data = ProjectSerializer(project).data

        expert = getattr(project, 'expert_evaluation', None)
        expert_data = ExpertEvaluationRequestSerializer(
            expert).data if expert else None

        supervision = project.supervision_requests.all()
        supervision_data = SupervisionRequestSerializer(
            supervision, many=True).data

        execution = project.execution_requests.all()
        execution_data = ExecutionRequestSerializer(
            execution, many=True).data

        registration = getattr(project, 'registration_request', None)
        registration_data = RegistrationRequestSerializer(
            registration).data if registration else None

        data['requests'] = {
            'expert_evaluation': expert_data,
            'supervision': supervision_data,
            'execution': execution_data,
            'registration': registration_data,
        }

        return Response(data, status=status.HTTP_200_OK)
