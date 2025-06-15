
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from attachments.models import Attachment
from tickets.models import TicketSession, TicketMessage
from .serializers import AttachmentSerializer, AttachmentCreateSerializer
from django.contrib.contenttypes.models import ContentType
from django.http import FileResponse
import tempfile
import os
from PIL import Image
import fitz
import logging
import io

# تنظیم لاگ برای دیباگ
logger = logging.getLogger(__name__)


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return AttachmentCreateSerializer
        return AttachmentSerializer

    def get_queryset(self):
        return self.queryset.filter(uploaded_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='request-files/(?P<content_type>[^/.]+)/(?P<uuid>[0-9a-f-]+)')
    def request_files(self, request, content_type, uuid):
        try:
            content_type_obj = ContentType.objects.get(
                model=content_type.lower())
            model_class = content_type_obj.model_class()
            obj = model_class.objects.get(id=uuid)

            initial_files = Attachment.objects.filter(
                content_type=content_type_obj, object_id=uuid)
            ticket_files = Attachment.objects.filter(
                ticketmessage__ticket__content_type=content_type_obj,
                ticketmessage__ticket__object_id=uuid
            )
            admin_files = (
                Attachment.objects.filter(
                    content_type=content_type_obj, object_id=uuid, uploaded_by__is_staff=True)
                if hasattr(obj, 'status') and obj.status == 'completed'
                else Attachment.objects.none()
            )

            all_files = initial_files | ticket_files | admin_files
            serializer = self.get_serializer(
                all_files.distinct(), many=True)
            return Response(serializer.data)
        except (ContentType.DoesNotExist, model_class.DoesNotExist):
            return Response({'error': 'درخواست یا نوع غیرمعتبر'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='ticket-session-files/(?P<ticket_id>[0-9a-f-]+)')
    def ticket_session_files(self, request, ticket_id):
        try:
            ticket = TicketSession.objects.get(id=ticket_id)
            if ticket.user != request.user and not request.user.is_staff:
                return Response({'error': 'عدم دسترسی به سشن تیکت'}, status=status.HTTP_403_FORBIDDEN)
            files = Attachment.objects.filter(ticketmessage__ticket=ticket)
            serializer = self.get_serializer(files.distinct(), many=True)
            return Response(serializer.data)
        except TicketSession.DoesNotExist:
            return Response({'error': 'سشن تیکت یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='upload-admin/(?P<content_type>[^/.]+)/(?P<uuid>[0-9a-f-]+)')
    def upload_admin(self, request, content_type, uuid):
        if not request.user.is_staff:
            return Response({'error': 'فقط ادمین می‌تواند فایل آپلود کند.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            content_type_obj = ContentType.objects.get(
                model=content_type.lower())
            model_class = content_type_obj.model_class()
            obj = model_class.objects.get(id=uuid)
            if hasattr(obj, 'status') and obj.status != 'completed':
                return Response({'error': 'فقط برای درخواست‌های تکمیل‌شده می‌توان فایل آپلود کرد.'},
                                status=status.HTTP_400_BAD_REQUEST)
            serializer = AttachmentCreateSerializer(
                data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except (ContentType.DoesNotExist, model_class.DoesNotExist):
            return Response({'error': 'درخواست یا نوع غیرمعتبر'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], url_path='preview')
    def preview(self, request, pk=None):
        try:
            attachment = self.get_object()
            logger.debug(
                f"Preview requested for attachment {pk}: {attachment.file.name}")
            if not os.path.exists(attachment.file.path):
                logger.error(f"File not found: {attachment.file.path}")
                return Response({'error': 'فایل یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

            file_ext = os.path.splitext(attachment.file.name)[1].lower()
            logger.debug(f"File extension: {file_ext}")
            if file_ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
                logger.warning(
                    f"Unsupported file format for preview: {file_ext}")
                return Response({'error': 'پیش‌نمایش فقط برای PDF و تصاویر موجود است.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if file_ext == '.pdf':
                logger.debug(f"Processing PDF: {attachment.file.path}")
                try:
                    pdf_document = fitz.open(attachment.file.path)
                    page = pdf_document.load_page(0)
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img = Image.frombytes(
                        "RGB", [pix.width, pix.height], pix.samples)

                    # ذخیره تصویر تو حافظه به‌جای فایل موقت
                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    buffer.seek(0)

                    logger.debug("PDF converted to PNG in memory")
                    return FileResponse(buffer, content_type='image/png')
                except Exception as e:
                    logger.error(f"Error processing PDF: {str(e)}")
                    raise
            else:
                logger.debug(f"Serving image: {attachment.file.path}")
                return FileResponse(attachment.file, content_type=f'image/{file_ext[1:]}')
        except Exception as e:
            logger.error(f"Preview error for attachment {pk}: {str(e)}")
            return Response({'error': f'خطا در پیش‌نمایش: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
