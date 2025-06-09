# projects/api/urls.py :
from django.urls import path
from .views import (AllProjectView, CreateProjectRequestAPIView,
                    ProjectDetailAPIView, DashboardStatsAPIView,
                    )

urlpatterns = [
    path('', AllProjectView.as_view(), name='my-projects'),
    path('create/', CreateProjectRequestAPIView.as_view(), name='create-project'),
    path('<int:pk>/', ProjectDetailAPIView.as_view(), name='project-detail'),
    path('dashboard/', DashboardStatsAPIView.as_view(), name='dashboard-status'),

]
