from django.urls import path
from ..views import (
    ReferralCreateView,
    ReferralListView,
    ReferralDetailView,
    ReferralDeleteView,
    RequestUpdateView,
    AttachmentUploadView,
    ProjectReferralView,
    get_requests,
)

app_name = 'referrals'

urlpatterns = [
    path('', ReferralListView.as_view(), name='referral-list'),
    path('create/', ReferralCreateView.as_view(), name='referral-create'),
    path('<int:referral_id>/', ReferralDetailView.as_view(), name='referral-detail'),
    path('<int:referral_id>/delete/',
         ReferralDeleteView.as_view(), name='referral-delete'),
    path('update/<int:content_type_id>/<str:object_id>/',
         RequestUpdateView.as_view(), name='request-update'),
    path('upload-admin/<int:content_type_id>/<str:object_id>/',
         AttachmentUploadView.as_view(), name='attachment-upload'),
    path('project/<int:project_id>/',
         ProjectReferralView.as_view(), name='project-referral'),
    path('get_requests/', get_requests, name='get_requests'),
]
