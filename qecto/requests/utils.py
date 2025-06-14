# qecto/utils/utils.py
from datetime import datetime
from django.db import transaction
from requests.models import TrackingCode  # ایمپورت مدل TrackingCode


def generate_tracking_code(app_name, request_id):
    date_str = datetime.now().strftime("%Y%m%d")
    app_prefix = app_name[:3].upper()
    with transaction.atomic():
        count = TrackingCode.objects.filter(
            app_name=app_name.upper(),
            created_at__date=datetime.now().date()
        ).count() + 1
        tracking_code = f"REQ-{date_str}-{app_prefix}-{count:03d}"
        while TrackingCode.objects.filter(tracking_code=tracking_code).exists():
            count += 1
            tracking_code = f"REQ-{date_str}-{app_prefix}-{count:03d}"
        TrackingCode.objects.create(
            tracking_code=tracking_code,
            app_name=app_name.upper(),
            request_id=request_id,
            is_used=True
        )
        return tracking_code
