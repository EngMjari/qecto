# projects/api/urls.py :
from django.urls import path
from .views import PaginatedProjectDetailsAPIView, CreateProjectRequestAPIView, ProjectDetailAPIView

urlpatterns = [
    path('', PaginatedProjectDetailsAPIView.as_view(), name='my-projects'),
    path('create/', CreateProjectRequestAPIView.as_view(), name='create-project'),
    path('<int:pk>/', ProjectDetailAPIView.as_view(), name='project-detail'),
]
