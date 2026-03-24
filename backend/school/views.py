from rest_framework import viewsets
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Student, Fees, Teacher, Course, Notice, Gallery
from .serializers import *


# ================== VIEWSETS ==================

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class FeesViewSet(viewsets.ModelViewSet):
    queryset = Fees.objects.all()
    serializer_class = FeesSerializer


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-created_at')
    serializer_class = NoticeSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer


# ================== LOGIN API ==================

@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        return Response({
            "success": True,
            "username": user.username
        })
    else:
        return Response({
            "success": False,
            "message": "Invalid credentials"
        }, status=401)