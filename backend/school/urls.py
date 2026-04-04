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

# NEW: Extra Activities Routes
router.register('extra-activities', ExtraActivityViewSet)
router.register('student-activities', StudentActivityRegistrationViewSet)
router.register('activity-payments', ActivityPaymentViewSet)

# NEW: Teacher Salary Routes
router.register('teacher-salaries', TeacherSalaryViewSet)
router.register('teacher-salary-payments', TeacherSalaryPaymentViewSet)

# NEW: Login History
router.register('login-history', LoginHistoryViewSet)

urlpatterns = [
    path('login/', admin_login),
    path('teacher-login/', teacher_login),
    path('student-login/', student_login),
    path('dashboard-stats/', dashboard_stats),
    path('', include(router.urls)),
]