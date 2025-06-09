# expert/api/views.py : 
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ExpertEvaluationProjectCreateSerializer
from django.http import FileResponse, Http404
from expert.models import ExpertAttachment
import json
import os
import io


class ExpertProjectRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        data = request.data.copy()
        print(request.FILES)
        print(request.data.getlist('attachments'))

        # Parse location from stringified JSON if provided
        location_raw = data.get('location')
        if location_raw:
            try:
                location = json.loads(location_raw)
                data['location_lat'] = location.get('lat')
                data['location_lng'] = location.get('lng')
            except json.JSONDecodeError:
                return Response({'error': 'موقعیت جغرافیایی نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert QueryDict to plain dict
        simple_data = {key: data.get(key) for key in data.keys()}

        # Add file attachments
        files = request.FILES.getlist('attachments')
        simple_data['attachments'] = files

        serializer = ExpertEvaluationProjectCreateSerializer(data=simple_data, context={'request': request})

        if serializer.is_valid():
            expert_project = serializer.save()
            return Response({
                'message': 'درخواست کارشناسی ثبت شد',
                'project_id': expert_project.project.id,
                'expert_project_id': expert_project.id,
                'uploaded_files': [f.name for f in files],
            }, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpertAttachmentPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            attachment = ExpertAttachment.objects.get(pk=pk)
        except ExpertAttachment.DoesNotExist:
            raise Http404

        ext = os.path.splitext(attachment.file.name)[-1].lower().replace('.', '')

        # اگر عکس است، همان را برگردان
        if ext in ["jpg", "jpeg", "png", "gif", "bmp", "webp"]:
            return FileResponse(attachment.file, content_type=f"image/{ext}")

        # اگر PDF است، صفحه اول را به عکس تبدیل کن
        if ext == "pdf":
            try:
                from pdf2image import convert_from_path
                images = convert_from_path(attachment.file.path, first_page=1, last_page=1)
                img_io = io.BytesIO()
                images[0].save(img_io, format='PNG')
                img_io.seek(0)
                return FileResponse(img_io, content_type="image/png")
            except Exception as e:
                return Response({"error": "خطا در تبدیل PDF به عکس"}, status=400)

        # اگر اکسل است، یک عکس placeholder برگردان
        if ext in ["xls", "xlsx"]:
            from django.conf import settings
            placeholder_path = os.path.join(settings.BASE_DIR, "static/excel_placeholder.png")
            return FileResponse(open(placeholder_path, "rb"), content_type="image/png")

        # اگر dxf بود، با استفاده از ezdxf و matplotlib رسم کن
        if ext == "dxf":
            try:
                import ezdxf
                import matplotlib.pyplot as plt
                from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

                doc = ezdxf.readfile(attachment.file.path)
                msp = doc.modelspace()

                fig = plt.figure(figsize=(8, 8))
                ax = fig.add_subplot(111)
                for e in msp:
                    if e.dxftype() == 'LINE':
                        start = e.dxf.start
                        end = e.dxf.end
                        ax.plot([start[0], end[0]], [start[1], end[1]], color='black')
                ax.axis('equal')
                ax.axis('off')

                img_io = io.BytesIO()
                plt.savefig(img_io, format='png', bbox_inches='tight', pad_inches=0)
                plt.close(fig)
                img_io.seek(0)
                return FileResponse(img_io, content_type="image/png")
            except Exception as e:
                return Response({"error": "خطا در تبدیل DXF به عکس"}, status=400)

        # اگر dwg بود، placeholder
        if ext == "dwg":
            from django.conf import settings
            placeholder_path = os.path.join(settings.BASE_DIR, "static/dwg_placeholder.png")
            return FileResponse(open(placeholder_path, "rb"), content_type="image/png")

        # سایر فرمت‌ها پشتیبانی نمی‌شود
        return Response({"error": "پیش‌نمایش این فرمت پشتیبانی نمی‌شود."}, status=400)
