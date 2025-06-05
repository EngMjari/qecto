from rest_framework.permissions import BasePermission


class IsTicketOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True

        if user.is_staff:
            return obj.assigned_admin == user

        return obj.user == user