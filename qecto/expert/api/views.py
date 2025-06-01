from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ExpertEvaluationProjectCreateSerializer
import json


class ExpertProjectRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        data = request.data.copy()
        print(request.FILES)
        print(request.data.getlist('attachments'))

        # Parse location from stringified JSON if provided
        location_raw = data.get('location')
        if location_raw:
            try:
                location = json.loads(location_raw)
                data['location_lat'] = location.get('lat')
                data['location_lng'] = location.get('lng')
            except json.JSONDecodeError:
                return Response({'error': 'موقعیت جغرافیایی نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert QueryDict to plain dict
        simple_data = {key: data.get(key) for key in data.keys()}

        # Add file attachments
        files = request.FILES.getlist('attachments')
        simple_data['attachments'] = files

        serializer = ExpertEvaluationProjectCreateSerializer(data=simple_data, context={'request': request})

        if serializer.is_valid():
            expert_project = serializer.save()
            return Response({
                'message': 'درخواست کارشناسی ثبت شد',
                'project_id': expert_project.project.id,
                'expert_project_id': expert_project.id,
                'uploaded_files': [f.name for f in files],
            }, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
