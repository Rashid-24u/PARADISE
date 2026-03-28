from django.db import IntegrityError, transaction
from rest_framework import viewsets, status
from django.contrib.auth import authenticate

from django.contrib.auth.hashers import check_password, make_password
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser



from .models import Student, Fees, Teacher, Course, Subject, Notice, Gallery, Payment, Attendance, Mark, Note
from .serializers import *


def _verify_password_and_upgrade(instance, raw_password, field_name="password"):
    """Match using check_password; support legacy plain text and upgrade to hash."""
    stored = getattr(instance, field_name) or ""
    if not raw_password or not stored:
        return False
    try:
        if check_password(raw_password, stored):
            return True
    except (TypeError, ValueError):
        pass
    if stored == raw_password:
        setattr(instance, field_name, make_password(raw_password))
        instance.save(update_fields=[field_name])
        return True
    return False


# ================== VIEWSETS ==================

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        course = self.request.query_params.get('course')
        if course:
            return Student.objects.filter(course=course)
        return Student.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}


class FeesViewSet(viewsets.ModelViewSet):
    queryset = Fees.objects.all()
    serializer_class = FeesSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer    


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

    # 🔥 IMPORTANT → for image upload
    parser_classes = [MultiPartParser, FormParser]

    # 🔥 for image_url (absolute URL)
    def get_serializer_context(self):
        return {'request': self.request}

    # 🔥 optional filtering (course wise)
    def get_queryset(self):
        course = self.request.query_params.get('course')
        if course:
            return Teacher.objects.filter(course=course)
        return Teacher.objects.all()


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by('-created_at')
    serializer_class = NoticeSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        teacher_obj = validated.get("teacher")
        course_obj = validated["course"]
        if teacher_obj is not None and teacher_obj.course_id:
            if course_obj.pk != teacher_obj.course_id:
                return Response(
                    {
                        "message": "You can only mark attendance for your assigned class.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        student = validated["student"]
        subject = validated.get("subject")
        date = validated["date"]
        period = validated.get("period")
        status_val = validated["status"]

        if period is None:
            return Response(
                {"message": "Period is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Attendance.objects.filter(
            student=student,
            date=date,
            period=period,
            subject=subject,
        ).exists():
            return Response(
                {
                    "success": False,
                    "message": "Attendance already marked",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                obj = Attendance.objects.create(
                    student=student,
                    course=course_obj,
                    subject=subject,
                    teacher=validated.get("teacher"),
                    date=date,
                    period=period,
                    status=status_val,
                )
        except IntegrityError:
            return Response(
                {
                    "success": False,
                    "message": "Attendance already marked",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        out = self.get_serializer(obj)
        return Response(
            {
                "success": True,
                "message": "Attendance saved successfully",
                "data": out.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        queryset = Attendance.objects.all()

        student = self.request.query_params.get('student')
        course = self.request.query_params.get('course')
        subject = self.request.query_params.get('subject')
        teacher = self.request.query_params.get('teacher')
        date = self.request.query_params.get('date')
        period = self.request.query_params.get('period')

        if student:
            queryset = queryset.filter(student=student)

        if course:
            queryset = queryset.filter(course=course)

        if subject:
            queryset = queryset.filter(subject=subject)

        if teacher:
            queryset = queryset.filter(teacher=teacher)

        if date:
            queryset = queryset.filter(date=date)

        if period:
            queryset = queryset.filter(period=period)

        return queryset


class MarkViewSet(viewsets.ModelViewSet):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        subject = data["subject"]
        if isinstance(subject, str):
            subject = subject.strip()

        defaults = {
            "course": data["course"],
            "marks": data["marks"],
        }
        if "max_marks" in data and data["max_marks"] is not None:
            defaults["max_marks"] = data["max_marks"]

        obj, created = Mark.objects.update_or_create(
            student=data["student"],
            subject=subject,
            exam_type=data["exam_type"],
            defaults=defaults,
        )

        out = self.get_serializer(obj)
        msg = (
            "Marks saved successfully"
            if created
            else "Marks updated successfully"
        )
        return Response(
            {
                "success": True,
                "message": msg,
                "created": created,
                "data": out.data,
            },
            status=status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK,
        )

    def get_queryset(self):
        queryset = Mark.objects.all()

        student = self.request.query_params.get('student')
        course = self.request.query_params.get('course')

        if student:
            queryset = queryset.filter(student=student)
        if course:
            queryset = queryset.filter(course=course)

        return queryset


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

    def get_queryset(self):
        queryset = Note.objects.all()
        course = self.request.query_params.get('course')
        if course:
            queryset = queryset.filter(course=course)
        return queryset



# ================== LOGIN API ==================

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        return Response({
            "success": True,
            "user_id": user.id,
            "username": user.username,
        })
    else:
        return Response({
            "success": False,
            "message": "Invalid credentials"
        }, status=401)



@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def teacher_login(request):
    email = (request.data.get('email') or '').strip()
    password = (request.data.get('password') or '').strip()

    if not email or not password:
        return Response({"success": False, "message": "Email and password are required"}, status=400)

    try:
        teacher = Teacher.objects.select_related("course", "subject").get(email__iexact=email)

        if _verify_password_and_upgrade(teacher, password):
            return Response({
                "success": True,
                "teacher_id": teacher.id,
                "name": teacher.name,
                "email": teacher.email,
                "course": teacher.course_id,
                "course_name": teacher.course.name if teacher.course else None,
                "subject": teacher.subject_id,
                "subject_name": teacher.subject.name if teacher.subject else None,
            })
        return Response({"success": False, "message": "Invalid credentials"}, status=401)

    except Teacher.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def student_login(request):
    admission_no = (request.data.get('admission_no') or '').strip()
    password = (request.data.get('password') or '').strip()

    if not admission_no or not password:
        return Response({"success": False, "message": "Admission number and password are required"}, status=400)

    try:
        student = Student.objects.select_related("course").get(admission_no__iexact=admission_no)

        if _verify_password_and_upgrade(student, password):
            return Response({
                "success": True,
                "student_id": student.id,
                "name": student.name,
                "admission_no": student.admission_no,
                "course": student.course_id,
                "course_name": student.course.name if student.course else None,
            })
        return Response({"success": False, "message": "Invalid credentials"}, status=401)

    except Student.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)