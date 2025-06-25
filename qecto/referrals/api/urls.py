from django.urls import path
from ..views import ReferralCreateView, ReferralListView, RequestUpdateView, AttachmentUploadView, ProjectReferralView, get_requests

urlpatterns = [
    path('', ReferralCreateView.as_view(), name='referral-create'),
    path('list/', ReferralListView.as_view(), name='referral-list'),
    path(
        '<int:content_type_id>/<str:object_id>/update/',
        RequestUpdateView.as_view(),
        name='request-update',
    ),
    path(
        '<int:content_type_id>/<str:object_id>/attachments/',
        AttachmentUploadView.as_view(),
        name='attachment-upload',
    ),
    path('project/<str:project_id>/',
         ProjectReferralView.as_view(), name='project-referral'),
    path('get_requests/', get_requests, name='get_requests'),
]
