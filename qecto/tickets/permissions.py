from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrAdmin(BasePermission):
    """
    فقط خود کاربر سازنده تیکت یا ادمین می‌تواند مشاهده یا تغییر بده.
    """
    def has_object_permission(self, request, view, obj):
        # خواندن فقط برای صاحب تیکت یا ادمین
        if request.method in SAFE_METHODS:
            return obj.created_by == request.user or request.user.is_staff
        
        # تغییرات هم فقط برای صاحب تیکت یا ادمین
        return obj.created_by == request.user or request.user.is_staff


class IsAdminOrReadOnly(BasePermission):
    """
    فقط ادمین می‌تواند تغییر بده، بقیه فقط خواندن داشته باشند.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff
