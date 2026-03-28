from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('students', StudentViewSet)
router.register('fees', FeesViewSet)
router.register('teachers', TeacherViewSet)
router.register('courses', CourseViewSet)
router.register('subjects', SubjectViewSet)
router.register('notices', NoticeViewSet)
router.register('gallery', GalleryViewSet)
router.register('payments', PaymentViewSet)
router.register('attendance', AttendanceViewSet)
router.register('marks', MarkViewSet)
router.register('notes', NoteViewSet)

urlpatterns = [
    path('login/', admin_login),
    path('teacher-login/', teacher_login),
    path('student-login/', student_login),  # 🔥 ADD THIS
    path('', include(router.urls)),
]