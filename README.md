# سامانه درخواست دفتر فنی مهندسی

این سامانه جهت ثبت و مدیریت درخواست‌های کاربران توسط دفاتر فنی مهندسی طراحی شده است. کاربران می‌توانند درخواست‌های خود در زمینه‌های مختلف نظیر نقشه‌برداری، کارشناسی، ثبت سند، نظارت و اجرا را ثبت کنند. تیم فنی نیز می‌تواند پروژه‌ها را مدیریت کرده و اسناد و فایل‌های مرتبط با هر درخواست را در سامانه قرار دهد.

این سامانه با استفاده از Django در بخش بک‌اند و React در بخش فرانت‌اند طراحی شده و از احراز هویت با شماره موبایل، سیستم ارسال فایل، و رابط کاربری واکنش‌گرا بهره می‌برد.

## نصب و راه‌اندازی

ابتدا مخزن را کلون کنید:

```
git clone https://github.com/yourusername/qecto.git
cd qecto
```

### راه‌اندازی Backend (Django)

```
cd qecto-backend
python -m venv env
source env/bin/activate  # در ویندوز: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # ساخت اولین ادمین
python manage.py runserver
```

### راه‌اندازی Frontend (React)

```
cd qecto-frontend
npm install
npm start
```

## تکنولوژی‌ها

- Python 3.10+
- Django + Django REST Framework
- React 19 + Vite + CRACO
- Tailwind CSS + Bootstrap 5
- SQLite (در حالت توسعه)
- JWT Auth
- Axios, React Router, Toastify
- Leaflet / Google Maps API

## اجرای تست

### بک‌اند:
```
python manage.py test
```

### فرانت‌اند:
```
npm run test
```

## تماس

- توسعه‌دهنده: محمد جاری
- ایمیل: mohammad.jarii@gmail.com
- سفارش‌دهنده: شرکت ککتوسازه هیرکاسب

## لایسنس

این پروژه تحت مجوز استفاده آموزشی آزاد ارائه شده است. استفاده از کد منبع در مقاصد آموزشی و توسعه آزاد است، اما هرگونه بهره‌برداری تجاری یا اجرایی از سامانه بدون دریافت لایسنس از صاحب اثر مجاز نمی‌باشد.

در صورت نیاز به دریافت مجوز رسمی بهره‌برداری، لطفاً با توسعه‌دهنده تماس بگیرید.
