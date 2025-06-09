# survey/api/views.py :
from rest_framework.parsers import MultiPartParser, FormParser
from projects.models import Project, ProjectStatus
from survey.models import SurveyProject
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from survey.models import SurveyAttachment
import json
import os
import io
from django.http import FileResponse, Http404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
import openpyxl
from PIL import Image, ImageDraw, ImageFont
import ezdxf
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas


class SurveyProjectRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # دریافت داده‌ها
        title = request.data.get('title')
        description = request.data.get('description', '')
        area = request.data.get('area')
        property_type = request.data.get('propertyType')
        location_raw = request.data.get('location')
        property_type = property_type if property_type else 'other'
        main_parcel_number = request.data.get('mainParcelNumber') or None
        sub_parcel_number = request.data.get('subParcelNumber') or None
        # بررسی اعتبار پارامترهای ارسالی
        if area is not None:
            try:
                area = float(area)
            except ValueError:
                return Response({'error': 'مساحت باید یک عدد باشد'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            area = None
        if main_parcel_number is not None:
            try:
                main_parcel_number = int(main_parcel_number)
            except ValueError:
                return Response({'error': 'پلاک اصلی باید یک عدد باشد'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            main_parcel_number = None
        if sub_parcel_number is not None:
            try:
                sub_parcel_number = int(sub_parcel_number)
            except ValueError:
                return Response({'error': 'پلاک فرعی باید یک عدد باشد'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            sub_parcel_number = None
        # بررسی اعتبار مختصات مکانی
        location_lat = request.data.get('locationLat')
        location_lng = request.data.get('locationLng')
        if location_lat is not None:
            try:
                location_lat = float(location_lat)
            except ValueError:
                return Response({'error': 'عرض جغرافیایی باید یک عدد باشد'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            location_lat = None
        if location_lng is not None:
            try:
                location_lng = float(location_lng)
            except ValueError:
                return Response({'error': 'طول جغرافیایی باید یک عدد باشد'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            location_lng = None
        location_raw = request.data.get('location', None)
        if location_raw is not None:
            try:
                location = json.loads(location_raw)
                location_lat = location.get('lat', None)
                location_lng = location.get('lng', None)
            except json.JSONDecodeError:
                return Response({'error': 'موقعیت جغرافیایی نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            location = None
            location_lat = None
            location_lng = None
        # بررسی اعتبار پارامترهای ارسالی
        if area is not None and area <= 0:
            return Response({'error': 'مساحت باید بزرگتر از صفر باشد'}, status=status.HTTP_400_BAD_REQUEST)
        if main_parcel_number is not None and main_parcel_number <= 0:
            return Response({'error': 'پلاک اصلی باید بزرگتر از صفر باشد'}, status=status.HTTP_400_BAD_REQUEST)
        if sub_parcel_number is not None and sub_parcel_number <= 0:
            return Response({'error': 'پلاک فرعی باید بزرگتر از صفر باشد'}, status=status.HTTP_400_BAD_REQUEST)

        # بررسی اعتبار عنوان و نوع ملک
        if not title:
            return Response({'error': 'عنوان پروژه الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        property_type = request.data.get('propertyType')
        if not property_type or property_type.strip() == "":
            return Response({'error': 'نوع ملک الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        # بررسی اعتبار مختصات مکانی
        try:
            location = json.loads(location_raw) if location_raw else None
            location_lat = location.get('lat') if location else None
            location_lng = location.get('lng') if location else None
        except json.JSONDecodeError:
            return Response({'error': 'موقعیت جغرافیایی نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        # ایجاد پروژه‌ی اصلی
        project = Project.objects.create(
            title=title,
            description=description,
            owner=request.user,
            created_by=request.user,
            project_type='survey',
            status=ProjectStatus.PENDING,


        )

        # ایجاد پروژه‌ی نقشه‌برداری
        survey_project = SurveyProject.objects.create(
            project=project,
            description=description,
            area=area,
            location_lat=location_lat,
            location_lng=location_lng,
            property_type=property_type,
            main_parcel_number=main_parcel_number,
            sub_parcel_number=sub_parcel_number,
            status='pending',  # وضعیت اولیه
            assigned_admin=None,  # در صورت نیاز می‌توانید مدیر را تعیین کنید
            created_at=project.created_at,
            updated_at=project.updated_at,
        )

        # ذخیره فایل‌های پیوست (در صورت وجود)
        files = request.FILES.getlist('attachments')
        titles = request.POST.getlist('titles')

        for i, file in enumerate(files):
            attachment_title = titles[i] if i < len(titles) else ""
            SurveyAttachment.objects.create(
                survey_project=survey_project,
                title=attachment_title,
                file=file,
                uploaded_by=request.user
            )

        return Response({
            'message': 'درخواست نقشه‌برداری ثبت شد',
            'project_id': project.id,
            'survey_project_id': survey_project.id,
            'uploaded_files': [f.name for f in files],
        }, status=status.HTTP_201_CREATED)


class SurveyAttachmentPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            attachment = SurveyAttachment.objects.get(pk=pk)
        except SurveyAttachment.DoesNotExist:
            raise Http404

        ext = os.path.splitext(attachment.file.name)[-1].lower()
        ext = ext.replace('.', '')

        # اگر عکس است، همان را برگردان
        if ext in ["jpg", "jpeg", "png", "gif", "bmp", "webp"]:
            return FileResponse(attachment.file, content_type=f"image/{ext}")

        # اگر PDF است، صفحه اول را به عکس تبدیل کن
        if ext == "pdf":
            try:
                from pdf2image import convert_from_path
                images = convert_from_path(
                    attachment.file.path, first_page=1, last_page=1)
                img_io = io.BytesIO()
                images[0].save(img_io, format='PNG')
                img_io.seek(0)
                return FileResponse(img_io, content_type="image/png")
            except Exception as e:
                return Response({"error": "خطا در تبدیل PDF به عکس"}, status=400)

        # اگر اکسل است، preview واقعی بساز
        if ext in ["xls", "xlsx"]:
            try:

                wb = openpyxl.load_workbook(attachment.file.path)
                ws = wb.active
                rows = list(ws.iter_rows(values_only=True))
                preview_rows = rows[:10]
                cell_width, cell_height = 120, 30
                n_cols = max(len(r) for r in preview_rows)
                img_width = n_cols * cell_width
                img_height = len(preview_rows) * cell_height
                img = Image.new("RGB", (img_width, img_height), "white")
                draw = ImageDraw.Draw(img)
                font = ImageFont.load_default()
                for i, row in enumerate(preview_rows):
                    for j, val in enumerate(row):
                        x = j * cell_width
                        y = i * cell_height
                        draw.rectangle(
                            [x, y, x+cell_width, y+cell_height], outline="gray")
                        draw.text(
                            (x+5, y+5), str(val) if val is not None else "", fill="black", font=font)
                img_io = io.BytesIO()
                img.save(img_io, format="PNG")
                img_io.seek(0)
                return FileResponse(img_io, content_type="image/png")
            except Exception as e:
                print("Excel Preview Error:", e)
                return Response({"error": "خطا در تبدیل Excel به عکس"}, status=400)

        # اگر dxf یا dwg بود، ارور بده
        if ext in ["dxf", "dwg"]:
            return Response({"error": "پیش‌نمایش این فرمت پشتیبانی نمی‌شود."}, status=400)

        return Response({"error": "فرمت فایل پشتیبانی نمی‌شود."}, status=400)
