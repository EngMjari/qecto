# core/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsGuest(BasePermission):
    """
    فقط مهمان‌ها (گمنام‌ها) اجازه دسترسی دارند.
    """

    def has_permission(self, request, view):
        return not request.user or not request.user.is_authenticated


class IsNormalUser(BasePermission):
    """
    فقط کاربران عادی (نه ادمین، نه سوپر ادمین)
    """

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and not user.is_staff and not user.is_superuser


class IsAdmin(BasePermission):
    """
    فقط ادمین‌ها (is_staff=True و is_superuser=False)
    """

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.is_staff and not user.is_superuser


class IsSuperAdmin(BasePermission):
    """
    فقط سوپر ادمین‌ها (is_superuser=True)
    """

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.is_superuser


class IsAdminOrSuperAdmin(BasePermission):
    """
    فقط ادمین یا سوپر ادمین اجازه دارند.
    کاربر عادی و مهمان رد می‌شوند.
    """

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and (user.is_staff or user.is_superuser)


class IsAuthenticatedUserOnly(BasePermission):
    """
    فقط کاربران لاگین کرده (authenticated) اجازه دارند.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
