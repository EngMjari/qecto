# core/utils.py
from datetime import datetime


def generate_tracking_code_base(app_name, count):
    date_str = datetime.now().strftime("%Y%m%d")
    app_prefix = app_name[:3].upper()  # SUR, SUP, EXP, EXE, REG
    return f"REQ-{date_str}-{app_prefix}-{count:03d}"
