from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from tickets.models import TicketSession, TicketMessage
from attachments.models import Attachment
from .serializers import (
    TicketSessionSerializer, TicketSessionCreateSerializer,
    TicketMessageSerializer, TicketMessageCreateSerializer,
    MessageAttachmentCreateSerializer,
)
from django.contrib.contenttypes.models import ContentType
from survey.models import SurveyRequest
from supervision.models import SupervisionRequest
from expert.models import ExpertEvaluationRequest
from execution.models import ExecutionRequest
from registration.models import RegistrationRequest
from attachments.api.serializers import AttachmentSerializer
from django.db.models import Count


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class TicketSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get(self, request):
        user = request.user
        if user.is_superuser:
            sessions = TicketSession.objects.all()
        elif user.is_staff:
            sessions = TicketSession.objects.filter(assigned_admin=user)
        else:
            sessions = TicketSession.objects.filter(user=user)

        # اعمال فیلترها
        if 'session_type' in request.query_params:
            sessions = sessions.filter(
                session_type=request.query_params['session_type'])
        if 'status' in request.query_params:
            sessions = sessions.filter(status=request.query_params['status'])
        if 'title' in request.query_params:
            sessions = sessions.filter(
                title__icontains=request.query_params['title'])
        if 'created_at__gte' in request.query_params:
            sessions = sessions.filter(
                created_at__gte=request.query_params['created_at__gte'])
        if 'created_at__lte' in request.query_params:
            sessions = sessions.filter(
                created_at__lte=request.query_params['created_at__lte'])
        if 'content_type' in request.query_params:
            try:
                content_type = ContentType.objects.get(
                    model=request.query_params['content_type'])
                sessions = sessions.filter(content_type=content_type)
            except ContentType.DoesNotExist:
                sessions = sessions.none()

        # محاسبه آمار
        stats = {
            'total_tickets': sessions.count(),
            'status_counts': sessions.values('status').annotate(count=Count('status')),
            'session_type_counts': sessions.values('session_type').annotate(count=Count('session_type')),
        }

        # صفحه‌بندی
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(sessions, request)
        serializer = TicketSessionSerializer(page, many=True)
        response_data = {
            'results': serializer.data,
            'stats': stats,
        }
        return paginator.get_paginated_response(response_data)

    def post(self, request):
        serializer = TicketSessionCreateSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            ticket = serializer.save()
            return Response(TicketSessionSerializer(ticket).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = TicketSession.objects.get(id=session_id, status='open')
            user = request.user
            if not user.is_superuser and session.user != user and session.assigned_admin != user:
                return Response({'error': 'عدم دسترسی'}, status=status.HTTP_403_FORBIDDEN)
            serializer = TicketMessageCreateSerializer(
                data=request.data, context={
                    'request': request, 'ticket': session}
            )
            if serializer.is_valid():
                message = serializer.save()
                return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TicketSession.DoesNotExist:
            return Response({'error': 'سشن یافت نشد یا بسته است'}, status=status.HTTP_404_NOT_FOUND)


class TicketSessionCloseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = TicketSession.objects.get(id=session_id, status='open')
            user = request.user
            if not user.is_superuser and session.user != user and session.assigned_admin != user:
                return Response({'error': 'عدم دسترسی'}, status=status.HTTP_403_FORBIDDEN)
            session.status = 'closed'
            session.closed_reason = request.data.get('reason', '')
            session.save()
            return Response({'message': 'سشن بسته شد'}, status=status.HTTP_200_OK)
        except TicketSession.DoesNotExist:
            return Response({'error': 'سشن یافت نشد یا بسته است'}, status=status.HTTP_404_NOT_FOUND)


class TicketSessionsByRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, request_id, request_type):
        user = request.user
        try:
            model_map = {
                'survey': SurveyRequest,
                'supervision': SupervisionRequest,
                'expert': ExpertEvaluationRequest,
                'execution': ExecutionRequest,
                'registration': RegistrationRequest,
            }
            model = model_map.get(request_type)
            if not model:
                return Response({'error': 'نوع درخواست نامعتبر'}, status=status.HTTP_400_BAD_REQUEST)

            request_obj = model.objects.get(id=request_id)

            # بررسی دسترسی
            if not user.is_superuser:
                if hasattr(request_obj, 'owner'):
                    if request_obj.owner != user and request_obj.assigned_admin != user:
                        return Response({'error': 'عدم دسترسی'}, status=status.HTTP_403_FORBIDDEN)
                elif request_obj.project.owner != user:
                    return Response({'error': 'عدم دسترسی'}, status=status.HTTP_403_FORBIDDEN)

            content_type = ContentType.objects.get_for_model(model)
            sessions = TicketSession.objects.filter(
                content_type=content_type, object_id=request_id)
            serializer = TicketSessionSerializer(sessions, many=True)
            return Response({'results': serializer.data})
        except model.DoesNotExist:
            return Response({'error': 'درخواست یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        # user = request.user
        # try:
        #     model_map = {
        #         'survey': SurveyRequest,
        #         'supervision': SupervisionRequest,
        #         'expert': ExpertEvaluationRequest,
        #         'execution': ExecutionRequest,
        #         'registration': RegistrationRequest,
        #     }
        #     model = model_map.get(request_type)
        #     if not model:
        #         print(f"Invalid request_type: {request_type}")
        #         return Response({'error': 'نوع درخواست نامعتبر'}, status=status.HTTP_400_BAD_REQUEST)

        #     print(f"Looking for {model.__name__} with id {request_id}")
        #     request_obj = model.objects.get(id=request_id)
        #     print(f"Found object: {request_obj.id}")
        #     if not user.is_superuser:
        #         if hasattr(request_obj, 'owner'):
        #             if request_obj.owner != user:
        #                 print(
        #                     f"User {user} is not owner of {request_obj.id}")
        #                 return Response({'error': 'عدم دسترسی'}, status=status.HTTP_403_FORBIDDEN)
        #         elif request_obj.project.owner != user:
        #             print(
        #                 f"User {user} is not project owner of {request_obj.id}")
        #             return Response({'error': 'عدم دسترسی'}, status=status.HTTP_403_FORBIDDEN)

        #     content_type = ContentType.objects.get_for_model(model)
        #     sessions = TicketSession.objects.filter(
        #         content_type=content_type, object_id=request_id)
        #     serializer = TicketSessionSerializer(sessions, many=True)
        #     return Response({'results': serializer.data})
        # except model.DoesNotExist:
        #     print(f"{model.__name__} with id {request_id} does not exist")
        #     return Response({'error': 'درخواست یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class TicketMessageAttachmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ticket_id, message_id):
        try:
            ticket = TicketSession.objects.get(id=ticket_id)
            message = TicketMessage.objects.get(id=message_id, ticket=ticket)
            user = request.user
            if not user.is_superuser and message.sender != user:
                return Response({'error': 'عدم دسترسی'}, status=status.HTTP_403_FORBIDDEN)
        except (TicketSession.DoesNotExist, TicketMessage.DoesNotExist):
            return Response({'error': 'تیکت یا پیام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MessageAttachmentCreateSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            attachment = Attachment.objects.create(
                content_type=ContentType.objects.get_for_model(TicketMessage),
                object_id=message.id,
                file=serializer.validated_data['file'],
                title=serializer.validated_data.get(
                    'title', '') or serializer.validated_data['file'].name,
                uploaded_by=user
            )
            message.attachments.add(attachment)
            return Response(AttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketSessionReopenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = TicketSession.objects.get(id=session_id, status='closed')
            user = request.user
            if not user.is_superuser and session.assigned_admin != user:
                return Response({'error': 'عدم دسترسی'}, status=status.HTTP_403_FORBIDDEN)
            # بررسی وجود سشن باز دیگر برای همان درخواست
            if session.content_type and session.object_id:
                existing_open_session = TicketSession.objects.filter(
                    content_type=session.content_type,
                    object_id=session.object_id,
                    status='open'
                ).exclude(id=session_id).exists()
                if existing_open_session:
                    return Response(
                        {'error': 'یک سشن باز برای این درخواست وجود دارد.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            session.status = 'open'
            session.closed_reason = ''
            session.save()
            return Response({'message': 'سشن باز شد'}, status=status.HTTP_200_OK)
        except TicketSession.DoesNotExist:
            return Response({'error': 'سشن یافت نشد یا باز است'}, status=status.HTTP_404_NOT_FOUND)
