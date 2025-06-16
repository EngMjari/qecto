# requests/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.contenttypes.models import ContentType
from supervision.models import SupervisionRequest
from expert.models import ExpertEvaluationRequest
from execution.models import ExecutionRequest
from registration.models import RegistrationRequest
from .serializers import (
    SupervisionRequestSerializer, SurveyRequestSerializer,
    ExpertEvaluationRequestSerializer, ExecutionRequestSerializer,
    RegistrationRequestSerializer, RequestStatsSerializer
)
from uuid import UUID
import logging
from survey.models import SurveyRequest

logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserRequestsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['project__title', 'description',
                     'tracking_code']  # حذف permit_number
    filterset_fields = ['request_type', 'status', 'tracking_code']
    lookup_field = 'pk'
    lookup_value_regex = '[0-9a-f-]+'

    def get_queryset(self, request_type=None):
        user = self.request.user
        logger.debug(
            f"User: {user.id}, phone: {user.phone}, is_superuser: {user.is_superuser}, is_staff: {user.is_staff}, request_type: {request_type}")
        request_types = {
            'survey': (SurveyRequest, SurveyRequestSerializer),
            'supervision': (SupervisionRequest, SupervisionRequestSerializer),
            'expert': (ExpertEvaluationRequest, ExpertEvaluationRequestSerializer),
            'execution': (ExecutionRequest, ExecutionRequestSerializer),
            'registration': (RegistrationRequest, RegistrationRequestSerializer),
        }
        if request_type not in request_types:
            logger.debug(f"Invalid request_type: {request_type}")
            return None

        model, _ = request_types[request_type]
        try:
            if user.is_superuser:
                qs = model.objects.all().select_related('project')
            elif user.is_staff:
                qs = model.objects.filter(
                    assigned_admin=user).select_related('project')
            else:
                qs = model.objects.filter(owner=user).select_related('project')
            logger.debug(
                f"Queryset for {request_type}: {qs.count()} objects, query: {qs.query}")
            return qs
        except Exception as e:
            logger.error(f"Error in get_queryset for {request_type}: {str(e)}")
            return None

    @action(detail=False, methods=['get'], url_path='all')
    def list_all_requests(self, request):
        logger.debug(
            f"Starting list_all_requests with params: {request.query_params}")
        request_type = request.query_params.get('request_type')
        status_param = request.query_params.get('status')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        project_id = request.query_params.get('project_id')
        tracking_code = request.query_params.get('tracking_code')
        search_query = request.query_params.get('search')

        all_requests = []
        request_types = ['survey', 'supervision',
                         'expert', 'execution', 'registration']
        if request_type and request_type in request_types:
            request_types = [request_type]
            logger.debug(f"Filtering by request_type: {request_type}")

        stats = {
            'total_requests': 0,
            'status_counts': {},
            'request_type_counts': {}
        }

        for r_type in request_types:
            qs = self.get_queryset(r_type)
            if qs is None:
                logger.debug(f"No queryset for {r_type}, skipping")
                continue

            logger.debug(f"Processing {r_type}, initial count: {qs.count()}")

            # اعمال فیلترها
            if status_param:
                qs = qs.filter(status=status_param)
                logger.debug(
                    f"After status filter ({status_param}), count: {qs.count()}")
            if start_date:
                qs = qs.filter(created_at__gte=start_date)
                logger.debug(
                    f"After start_date filter ({start_date}), count: {qs.count()}")
            if end_date:
                qs = qs.filter(created_at__lte=end_date)
                logger.debug(
                    f"After end_date filter ({end_date}), count: {qs.count()}")
            if project_id:
                try:
                    qs = qs.filter(project__id=project_id)
                    logger.debug(
                        f"After project_id filter ({project_id}), count: {qs.count()}")
                except ValueError:
                    logger.error(f"Invalid project_id: {project_id}")
                    continue
            if tracking_code:
                qs = qs.filter(tracking_code=tracking_code)
                logger.debug(
                    f"After tracking_code filter ({tracking_code}), count: {qs.count()}")
            if search_query:
                logger.debug(f"Applying search query: {search_query}")
                qs = qs.filter(
                    Q(project__title__icontains=search_query) |
                    Q(description__icontains=search_query) |
                    Q(tracking_code__icontains=search_query)  # حذف permit_number
                )
                logger.debug(
                    f"After search filter ({search_query}), count: {qs.count()}")
                tracking_codes = qs.values_list('tracking_code', flat=True)
                logger.debug(
                    f"Tracking codes in queryset: {list(tracking_codes)}")

            logger.debug(f"Final {r_type} count: {qs.count()}")

            # سریالایز کردن
            serializer_class = {
                'survey': SurveyRequestSerializer,
                'supervision': SupervisionRequestSerializer,
                'expert': ExpertEvaluationRequestSerializer,
                'execution': ExecutionRequestSerializer,
                'registration': RegistrationRequestSerializer,
            }[r_type]
            serializer = serializer_class(qs, many=True)
            all_requests.extend(serializer.data)

            # به‌روزرسانی آمار
            stats['request_type_counts'][r_type] = qs.count()
            stats['total_requests'] += qs.count()
            for sc in qs.values('status').annotate(count=Count('status')):
                stats['status_counts'][sc['status']] = stats['status_counts'].get(
                    sc['status'], 0) + sc['count']

        logger.debug(f"Total requests collected: {len(all_requests)}")
        logger.debug(f"Stats: {stats}")

        if not all_requests:
            logger.info("No requests found for the given filters")
            return Response({
                'count': 0,
                'next': None,
                'previous': None,
                'results': [],
                'stats': RequestStatsSerializer(stats).data
            })

        # صفحه‌بندی
        paginator = self.pagination_class()
        paginated = paginator.paginate_queryset(all_requests, request)

        return Response({
            'count': len(all_requests),
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': paginated,
            'stats': RequestStatsSerializer(stats).data
        })

    @action(detail=True, methods=['get'], url_path='detail')
    def get_request_detail(self, request, pk=None):
        logger.debug(f"Fetching request detail for ID: {pk}")
        try:
            uuid = UUID(pk)
        except ValueError:
            logger.error(f"Invalid UUID format: {pk}")
            return Response({'error': 'Invalid UUID format'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        request_types = [
            ('survey', SurveyRequest, SurveyRequestSerializer),
            ('supervision', SupervisionRequest, SupervisionRequestSerializer),
            ('expert', ExpertEvaluationRequest, ExpertEvaluationRequestSerializer),
            ('execution', ExecutionRequest, ExecutionRequestSerializer),
            ('registration', RegistrationRequest, RegistrationRequestSerializer),
        ]

        for r_type, model, serializer_class in request_types:
            logger.debug(f"Checking {r_type} for ID: {uuid}")
            try:
                request_exists = model.objects.filter(id=uuid).exists()
                logger.debug(f"Request exists in {r_type}: {request_exists}")
                if not request_exists:
                    continue

                qs = self.get_queryset(r_type)
                if qs is None:
                    logger.debug(
                        f"No queryset for {r_type} (user has no access)")
                    continue

                logger.debug(
                    f"Queryset for {r_type}: {qs.count()} objects, query: {qs.query}")
                request_obj = qs.get(id=uuid)
                logger.debug(
                    f"Found request in {r_type}: {request_obj.id}, owner: {request_obj.owner.id}, assigned_admin: {getattr(request_obj, 'assigned_admin_id', None)}")
                serializer = serializer_class(request_obj)
                return Response(serializer.data)
            except model.DoesNotExist:
                logger.debug(
                    f"No {r_type} request found for ID: {uuid} with user access")
                continue
            except Exception as e:
                logger.error(f"Error checking {r_type}: {str(e)}")
                continue

        logger.error(
            f"Request {pk} not found or not authorized for user {user.id}")
        return Response({'error': 'Request not found or not authorized'}, status=status.HTTP_404_NOT_FOUND)


class ContentTypeListView(APIView):
    def get(self, request):
        content_types = ContentType.objects.filter(
            model__in=['surveyrequest', 'expertevaluationrequest',
                       'executionrequest', 'registrationrequest', 'supervisionrequest']
        )
        return Response([
            {'id': ct.id, 'app_label': ct.app_label, 'model': ct.model}
            for ct in content_types
        ])
