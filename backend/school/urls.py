from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('students', StudentViewSet)
router.register('fees', FeesViewSet)
router.register('teachers', TeacherViewSet)
router.register('courses', CourseViewSet)
router.register('notices', NoticeViewSet)
router.register('gallery', GalleryViewSet)

urlpatterns = [
    path('login/', admin_login),  # 🔥 ADD THIS
    path('', include(router.urls)),
]