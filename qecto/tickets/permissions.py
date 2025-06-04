from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsTicketOwnerOrAssignedAdminOrSuperAdmin(BasePermission):
    """
    اجازه می‌دهد فقط:
    - کاربر سازنده تیکت (created_by)
    - یا ادمینی که تیکت به او ارجاع شده (assigned_admin)
    - یا سوپرادمین (superuser)
    بتوانند تیکت را ببینند یا تغییر دهند.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True

        if request.method in SAFE_METHODS:
            return obj.created_by == user or obj.assigned_admin == user

        return obj.created_by == user or obj.assigned_admin == user

class IsSuperAdmin(BasePermission):
    """
    فقط سوپرادمین‌ها اجازه دسترسی دارند
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_superuser
