from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Referral
from .serializers import ReferralSerializer
from tickets.models import TicketSession
from attachments.models import Attachment
from attachments.api.serializers import AttachmentSerializer
from django.contrib.contenttypes.models import ContentType
from projects.models import Project
from survey.models import SurveyRequest
from supervision.models import SupervisionRequest
from expert.models import ExpertEvaluationRequest
from execution.models import ExecutionRequest
from registration.models import RegistrationRequest
from survey.api.serializers import SurveyRequestSerializer
from supervision.api.serializers import SupervisionRequestSerializer
from expert.api.serializers import ExpertEvaluationRequestSerializer
from execution.api.serializers import ExecutionRequestSerializer
from registration.api.serializers import RegistrationRequestUpdateSerializer
from core.models import AdminUser
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ReferralCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN
            )

        if not request.user.is_superuser and not self._is_current_assigned_admin(
            request.data.get('content_type'), request.data.get(
                'object_id'), request.user
        ):
            return Response(
                {'error': 'You are not the assigned admin for this request'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ReferralSerializer(data=request.data)
        if serializer.is_valid():
            referral = serializer.save(referrer_admin=request.user)
            content_type = referral.content_type
            model_class = content_type.model_class()
            try:
                request_obj = model_class.objects.get(id=referral.object_id)
                request_obj.assigned_admin = referral.assigned_admin
                request_obj.save()
                updated_tickets = TicketSession.objects.filter(
                    content_type=content_type,
                    object_id=referral.object_id,
                ).update(assigned_admin=referral.assigned_admin)
                return Response({
                    'referral': serializer.data,
                    'updated_tickets': updated_tickets
                }, status=status.HTTP_201_CREATED)
            except model_class.DoesNotExist:
                return Response(
                    {'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _is_current_assigned_admin(self, content_type_id, object_id, user):
        try:
            content_type = ContentType.objects.get(id=content_type_id)
            model_class = content_type.model_class()
            request_obj = model_class.objects.get(id=object_id)
            return request_obj.assigned_admin == user
        except (ContentType.DoesNotExist, model_class.DoesNotExist):
            return False


class ReferralListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get(self, request):
        project_id = request.query_params.get('project_id')
        referrals = Referral.objects.select_related(
            'content_type', 'referrer_admin', 'assigned_admin'
        ).order_by('-created_at')

        if project_id:
            try:
                project = Project.objects.get(id=project_id)
                content_types = ContentType.objects.filter(
                    model__in=[
                        'surveyrequest',
                        'supervisionrequest',
                        'expertevaluationrequest',
                        'executionrequest',
                        'registrationrequest',
                    ]
                )
                request_ids = []
                for ct in content_types:
                    model_class = ct.model_class()
                    ids = model_class.objects.filter(
                        project=project
                    ).values_list('id', flat=True)
                    request_ids.extend(ids)
                referrals = referrals.filter(object_id__in=request_ids)
            except Project.DoesNotExist:
                return Response(
                    {'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND
                )

        if not request.user.is_superuser:
            referrals = referrals.filter(referrer_admin=request.user)

        if not referrals.exists():
            return Response({
                'count': 0,
                'next': None,
                'previous': None,
                'results': [],
            })

        serializer = ReferralSerializer(referrals, many=True)
        paginator = self.pagination_class()
        paginated = paginator.paginate_queryset(serializer.data, request)
        return Response({
            'count': len(serializer.data),
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': paginated,
        })


class RequestUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, content_type_id, object_id):
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN
            )

        try:
            content_type = ContentType.objects.get(id=content_type_id)
            model_class = content_type.model_class()
            request_obj = model_class.objects.get(id=object_id)
        except (ContentType.DoesNotExist, model_class.DoesNotExist):
            return Response(
                {'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND
            )

        if not request.user.is_superuser and request_obj.assigned_admin != request.user:
            return Response(
                {'error': 'You are not the assigned admin'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer_class = {
            'surveyrequest': SurveyRequestSerializer,
            'supervisionrequest': SupervisionRequestSerializer,
            'expertevaluationrequest': ExpertEvaluationRequestSerializer,
            'executionrequest': ExecutionRequestSerializer,
            'registrationrequest': RegistrationRequestUpdateSerializer,
        }.get(content_type.model)

        serializer = serializer_class(
            request_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttachmentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, content_type_id, object_id):
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN
            )

        try:
            content_type = ContentType.objects.get(id=content_type_id)
            model_class = content_type.model_class()
            request_obj = model_class.objects.get(id=object_id)
        except (ContentType.DoesNotExist, model_class.DoesNotExist):
            return Response(
                {'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND
            )

        if not request.user.is_superuser and request_obj.assigned_admin != request.user:
            return Response(
                {'error': 'You are not the assigned admin'},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        data['content_type'] = content_type.id
        data['object_id'] = object_id
        data['uploaded_by'] = request.user.id
        serializer = AttachmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectReferralView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        if not request.user.is_superuser:
            return Response(
                {'error': 'Only superadmin can refer a project'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND
            )

        assigned_admin_id = request.data.get('assigned_admin')
        description = request.data.get('description', 'ارجاع پروژه به ادمین')

        if not assigned_admin_id:
            return Response(
                {'error': 'Assigned admin is required'}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            assigned_admin = AdminUser.objects.get(id=assigned_admin_id)
        except AdminUser.DoesNotExist:
            return Response(
                {'error': 'Assigned admin not found'}, status=status.HTTP_404_NOT_FOUND
            )

        content_types = ContentType.objects.filter(
            model__in=[
                'surveyrequest',
                'supervisionrequest',
                'expertevaluationrequest',
                'executionrequest',
                'registrationrequest',
            ]
        )
        created_referrals = []
        total_requests = 0
        debug_info = []
        for ct in content_types:
            model_class = ct.model_class()
            requests = model_class.objects.filter(project=project)
            request_count = requests.count()
            debug_info.append(
                f"Found {request_count} requests for model {ct.model}")
            total_requests += request_count
            for req in requests:
                try:
                    referral = Referral.objects.create(
                        content_type=ct,
                        object_id=req.id,
                        referrer_admin=request.user,
                        assigned_admin=assigned_admin,
                        description=description
                    )
                    req.assigned_admin = assigned_admin
                    req.save()
                    updated_tickets = TicketSession.objects.filter(
                        content_type=ct,
                        object_id=req.id
                    ).update(assigned_admin=assigned_admin)
                    created_referrals.append(referral)
                    debug_info.append(
                        f"Referred request {req.id} with {updated_tickets} tickets updated")
                except Exception as e:
                    debug_info.append(
                        f"Error referring request {req.id}: {str(e)}")

        serializer = ReferralSerializer(created_referrals, many=True)
        return Response({
            'message': f'{total_requests} درخواست برای پروژه {project.title} به {assigned_admin} ارجاع داده شد.',
            'referrals': serializer.data,
            'debug_info': debug_info
        }, status=status.HTTP_201_CREATED)


@staff_member_required
def get_requests(request):
    content_type_id = request.GET.get('content_type_id')
    try:
        content_type = ContentType.objects.get(id=content_type_id)
        model_class = content_type.model_class()
        requests = model_class.objects.all()
        request_list = [
            {
                'id': str(req.id),
                # اگر title وجود نداشت، id رو نشون بده
                'display_name': getattr(req, 'title', str(req.id))
            }
            for req in requests
        ]
        return JsonResponse({'requests': request_list})
    except ContentType.DoesNotExist:
        return JsonResponse({'requests': []})
