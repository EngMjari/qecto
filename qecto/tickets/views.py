from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import models
from rest_framework.exceptions import NotFound

from .models import TicketSession, TicketMessage, TicketMessageFile
from .serializers import TicketSessionSerializer, TicketMessageSerializer, TicketMessageFileSerializer
from .permissions import IsTicketOwnerOrAdmin  # حتما تعریف کن


class TicketSessionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TicketSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTicketOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return TicketSession.objects.all()
        elif user.is_staff:
            return TicketSession.objects.filter(
                models.Q(assigned_admin=user) | models.Q(
                    survey_request__isnull=True, evaluation_request__isnull=True)
            )
        else:
            return TicketSession.objects.filter(user=user)  # اصلاح

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # اصلاح


class TicketSessionRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = TicketSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTicketOwnerOrAdmin]
    queryset = TicketSession.objects.all()

    def get_object(self):
        try:
            return super().get_object()
        except TicketSession.DoesNotExist:
            raise NotFound("سشن مورد نظر پیدا نشد")

    def perform_update(self, serializer):
        user = self.request.user
        if not (user.is_staff or user.is_superuser):
            raise PermissionDenied("فقط ادمین می‌تواند سشن را ویرایش کند")
        serializer.save()


class TicketMessageListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TicketMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_session(self):
        session_id = self.kwargs.get('session_id')
        try:
            return TicketSession.objects.get(id=session_id)
        except TicketSession.DoesNotExist:
            raise NotFound("سشن مورد نظر پیدا نشد.")

    def get_queryset(self):
        session = self.get_session()
        user = self.request.user

        if user.is_superuser:
            return TicketMessage.objects.filter(session=session)

        elif user.is_staff:
            if session.assigned_admin == user or (session.survey_request is None and session.evaluation_request is None):
                return TicketMessage.objects.filter(session=session)
            else:
                return TicketMessage.objects.none()

        else:
            if session.user == user:
                return TicketMessage.objects.filter(session=session)
            else:
                return TicketMessage.objects.none()

    def perform_create(self, serializer):
        session = self.get_session()
        user = self.request.user

        if session.status != 'open':
            raise PermissionDenied("سشن بسته شده و امکان ارسال پیام وجود ندارد.")

        if user.is_staff:
            serializer.save(session=session, sender_admin=user)
        else:
            serializer.save(session=session, sender_user=user)



class TicketMessageFileUploadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, message_id):
        message = TicketMessage.objects.get(id=message_id)
        user = request.user
        if not (message.sender_user == user or message.sender_admin == user):
            return Response({"detail": "فقط فرستنده پیام اجازه آپلود دارد."}, status=403)

        files = request.FILES.getlist('files')
        created_files = []
        for f in files:
            tmf = TicketMessageFile.objects.create(message=message, file=f)
            created_files.append(tmf)
        serializer = TicketMessageFileSerializer(created_files, many=True)
        return Response(serializer.data)
