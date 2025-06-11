from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import TicketSession
from .serializers import (
    TicketSessionSerializer, CreateTicketSessionSerializer,
    CreateTicketMessageSerializer
)


class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # ادمین اجازه دارد همه را ببیند
        if request.user.is_staff:
            return True
        # کاربر فقط تیکت خودش را ببیند
        return obj.user == request.user


class TicketSessionListCreateAPIView(generics.ListCreateAPIView):
    """
    لیست تیکت‌ها برای کاربر یا ادمین و ایجاد تیکت جدید
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTicketSessionSerializer
        return TicketSessionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # ادمین همه تیکت‌ها را می‌بیند
            return TicketSession.objects.all()
        else:
            # کاربر فقط تیکت‌های خودش
            return TicketSession.objects.filter(user=user)


class TicketSessionRetrieveAPIView(generics.RetrieveAPIView):
    """
    گرفتن جزئیات یک تیکت به همراه پیام‌ها
    """
    serializer_class = TicketSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]
    queryset = TicketSession.objects.all()


class TicketMessageCreateAPIView(generics.CreateAPIView):
    """
    ارسال پیام جدید در تیکت (ادمین یا کاربر)
    """
    serializer_class = CreateTicketMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        session_id = self.kwargs['session_id']
        user = self.request.user
        try:
            session = TicketSession.objects.get(id=session_id)
        except TicketSession.DoesNotExist:
            raise PermissionDenied("تیکت مورد نظر وجود ندارد")

        # بررسی دسترسی: کاربر فقط تیکت خودش، ادمین همه را
        if not (user.is_staff or session.user == user):
            raise PermissionDenied(
                "شما اجازه ارسال پیام در این تیکت را ندارید.")

        # تعیین فرستنده (ادمین یا کاربر)
        sender_user = user if not user.is_staff else None
        sender_admin = user if user.is_staff else None

        serializer.save(session=session, sender_user=sender_user,
                        sender_admin=sender_admin)
