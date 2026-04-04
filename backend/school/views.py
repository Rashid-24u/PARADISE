from django.db import IntegrityError, transaction
from rest_framework import viewsets, status
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.decorators import api_view, authentication_classes, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Sum
from datetime import date

from .models import *
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


def log_login(user_type, user_id, user_name, request):
    """Helper function to log login attempts"""
    ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
    if ip and ',' in ip:
        ip = ip.split(',')[0]
    
    LoginHistory.objects.create(
        user_type=user_type,
        user_id=user_id,
        user_name=user_name,
        ip_address=ip or None
    )


# ================== VIEWSETS ==================

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Student.objects.all()

        course = self.request.query_params.get('course')

        if course:
            queryset = queryset.filter(course=course)

        return queryset

    def get_serializer_context(self):
        return {'request': self.request}
    
    @action(detail=True, methods=['get'])
    def fees_details(self, request, pk=None):
        student = self.get_object()
        try:
            fees = student.fees
            payments = fees.payments.all()
            total_paid = sum(p.amount for p in payments)
            
            data = {
                'total_fees': fees.total_amount,
                'total_paid': total_paid,
                'pending_balance': fees.total_amount - total_paid,
                'status': fees.status,
                'payments': PaymentSerializer(payments, many=True).data
            }
            return Response(data)
        except Fees.DoesNotExist:
            return Response({'error': 'Fee record not found'}, status=404)
    
    @action(detail=True, methods=['get'])
    def activity_details(self, request, pk=None):
        student = self.get_object()
        registrations = student.activity_registrations.all()
        
        data = []
        for reg in registrations:
            payments = reg.payments.all()
            total_paid = sum(p.amount for p in payments)
            data.append({
                'activity': reg.activity.name,
                'registered_at': reg.registered_at,
                'total_fee': reg.total_fee,
                'paid_amount': total_paid,
                'pending': reg.total_fee - total_paid,
                'status': reg.status,
                'payments': ActivityPaymentSerializer(payments, many=True).data
            })
        
        return Response(data)


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        return {'request': self.request}

    def get_queryset(self):
        course = self.request.query_params.get('course')
        if course:
            return Teacher.objects.filter(course=course)
        return Teacher.objects.all()
    
    def create(self, request, *args, **kwargs):
        print("=" * 50)
        print("📝 CREATING TEACHER")
        print("FILES received:", list(request.FILES.keys()))
        print("POST data keys:", list(request.POST.keys()))
        
        # Debug: Print all files
        for key in request.FILES.keys():
            print(f"   File field: {key} - {len(request.FILES.getlist(key))} files")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        teacher = self.get_object()
        serializer = TeacherDocumentSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(teacher=teacher)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['delete'], url_path='delete-document/(?P<doc_id>[^/.]+)')
    def delete_document(self, request, pk=None, doc_id=None):
        """Delete a specific document from a teacher"""
        try:
            teacher = self.get_object()
            
            # Find the document belonging to this teacher
            document = TeacherDocument.objects.get(id=doc_id, teacher=teacher)
            
            # Delete the physical file (optional but recommended)
            if document.file:
                document.file.delete(save=False)
            
            # Delete the database record
            document.delete()

            return Response({
                "success": True,
                "message": "Document deleted successfully"
            }, status=status.HTTP_200_OK)

        except TeacherDocument.DoesNotExist:
            return Response({
                "success": False,
                "error": "Document not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def salary_details(self, request, pk=None):
        teacher = self.get_object()
        salaries = teacher.salary_records.all()
        
        data = {
            'current_salary': teacher.salary,
            'total_paid': salaries.aggregate(total=Sum('paid_amount'))['total'] or 0,
            'total_pending': salaries.aggregate(total=Sum('pending_amount'))['total'] or 0,
            'salary_records': TeacherSalarySerializer(
                salaries, many=True, context={'request': request}
            ).data
        }
        return Response(data)


class ExtraActivityViewSet(viewsets.ModelViewSet):
    queryset = ExtraActivity.objects.all()
    serializer_class = ExtraActivitySerializer


class StudentActivityRegistrationViewSet(viewsets.ModelViewSet):
    queryset = StudentActivityRegistration.objects.all()
    serializer_class = StudentActivityRegistrationSerializer
    
    def get_queryset(self):
        queryset = StudentActivityRegistration.objects.all()
        student = self.request.query_params.get('student')
        activity = self.request.query_params.get('activity')
        
        if student:
            queryset = queryset.filter(student=student)
        if activity:
            queryset = queryset.filter(activity=activity)
        
        return queryset


class ActivityPaymentViewSet(viewsets.ModelViewSet):
    queryset = ActivityPayment.objects.all()
    serializer_class = ActivityPaymentSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        registration = serializer.validated_data['registration']
        amount = serializer.validated_data['amount']
        
        if amount > registration.pending_amount():
            return Response({
                'error': f'Amount exceeds pending balance. Pending: ₹{registration.pending_amount()}'
            }, status=400)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TeacherSalaryViewSet(viewsets.ModelViewSet):
    queryset = TeacherSalary.objects.all()
    serializer_class = TeacherSalarySerializer
    
    def get_queryset(self):
        queryset = TeacherSalary.objects.all()
        teacher = self.request.query_params.get('teacher')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        
        if teacher:
            queryset = queryset.filter(teacher=teacher)
        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)
        
        return queryset


class TeacherSalaryPaymentViewSet(viewsets.ModelViewSet):
    queryset = TeacherSalaryPayment.objects.all()
    serializer_class = TeacherSalaryPaymentSerializer


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
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            validated = serializer.validated_data
            teacher = validated.get("marked_by")
            student = validated["student"]
            course = validated["course"]
            date_val = validated["date"]

            # ✅ CHECK 1: student belongs to selected course
            if student.course != course:
                return Response(
                    {"error": "Student does not belong to selected course"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ✅ CHECK 2: prevent duplicate same student for same date
            if Attendance.objects.filter(student=student, date=date_val).exists():
                return Response(
                    {
                        "error": f"{student.name} already marked for {date_val}",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                with transaction.atomic():
                    obj = Attendance.objects.create(
                        student=student,
                        course=course,
                        date=date_val,
                        status=validated["status"],
                        marked_by=teacher,
                    )
            except IntegrityError:
                return Response(
                    {
                        "error": "Attendance already marked",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            out = self.get_serializer(obj)
            return Response(out.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            teacher_id = request.data.get("marked_by")
            status_value = request.data.get("status")
            
            # Convert teacher_id to int if it's a string
            if teacher_id and isinstance(teacher_id, str):
                try:
                    teacher_id = int(teacher_id)
                except ValueError:
                    pass
            
            # Update only the status field
            if status_value is not None:
                instance.status = status_value
            
            # Update marked_by to current teacher (track who last updated)
            if teacher_id:
                try:
                    instance.marked_by = Teacher.objects.get(id=teacher_id)
                except Teacher.DoesNotExist:
                    pass
            
            instance.save()
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests"""
        return self.update(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Attendance.objects.all()

        student = self.request.query_params.get("student")
        course = self.request.query_params.get("course")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        date = self.request.query_params.get("date")  # Added date filter

        if student:
            queryset = queryset.filter(student=student)

        if course:
            queryset = queryset.filter(course=course)
            
        if date:
            queryset = queryset.filter(date=date)

        if date_from:
            queryset = queryset.filter(date__gte=date_from)

        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        return queryset

    @action(detail=False, methods=["get"])
    def monthly_report(self, request):
        student = request.query_params.get("student")
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        if not student or not month or not year:
            return Response(
                {"error": "Student, month and year required"}, status=400
            )

        attendances = Attendance.objects.filter(
            student=student,
            date__month=month,
            date__year=year,
        )

        total_days = attendances.count()
        present_days = attendances.filter(status=True).count()

        data = {
            "total_days": total_days,
            "present_days": present_days,
            "absent_days": total_days - present_days,
            "attendance_percentage": (present_days / total_days * 100)
            if total_days > 0
            else 0,
            "records": AttendanceSerializer(attendances, many=True).data,
        }

        return Response(data)




class MarkViewSet(viewsets.ModelViewSet):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # ✅ CHECK: student belongs to selected course
        if data["student"].course != data["course"]:
            return Response(
                {"error": "Student not in selected course"},
                status=status.HTTP_400_BAD_REQUEST
            )

        subject = data["subject"]
        if isinstance(subject, str):
            subject = subject.strip()

        defaults = {
            "course": data["course"],
            "marks": data["marks"],
            "entered_by": data.get("entered_by"),
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
        msg = "Marks saved successfully" if created else "Marks updated successfully"

        return Response(
            {
                "success": True,
                "message": msg,
                "created": created,
                "data": out.data,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def get_queryset(self):
        queryset = Mark.objects.all()

        student = self.request.query_params.get('student')
        course = self.request.query_params.get('course')
        exam_type = self.request.query_params.get('exam_type')

        if student:
            queryset = queryset.filter(student=student)

        if course:
            queryset = queryset.filter(course=course)

        if exam_type:
            queryset = queryset.filter(exam_type=exam_type)

        return queryset

    @action(detail=False, methods=['get'])
    def student_report(self, request):
        student = request.query_params.get('student')

        if not student:
            return Response({'error': 'Student ID required'}, status=400)

        marks = Mark.objects.filter(student=student)
        report = {}

        for mark in marks:
            if mark.exam_type not in report:
                report[mark.exam_type] = []

            report[mark.exam_type].append({
                'subject': mark.subject,
                'marks': mark.marks,
                'max_marks': mark.max_marks,
                'percentage': (mark.marks / mark.max_marks * 100)
                if mark.max_marks > 0 else 0
            })

        return Response(report)

        

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

    def get_queryset(self):
        queryset = Note.objects.all()
        course = self.request.query_params.get('course')
        if course:
            queryset = queryset.filter(course=course)
        return queryset


class LoginHistoryViewSet(viewsets.ModelViewSet):
    queryset = LoginHistory.objects.all()
    serializer_class = LoginHistorySerializer
    
    def get_queryset(self):
        queryset = LoginHistory.objects.all()
        user_type = self.request.query_params.get('user_type')
        user_id = self.request.query_params.get('user_id')
        
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset


class FeesViewSet(viewsets.ModelViewSet):
    queryset = Fees.objects.all()
    serializer_class = FeesSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        fees = serializer.validated_data['fees']
        amount = serializer.validated_data['amount']

        total_paid = sum(p.amount for p in fees.payments.all())

        if total_paid + amount > fees.total_amount:
            return Response({
                "error": f"Amount exceeds total fee. Remaining: ₹{fees.total_amount - total_paid}"
            }, status=400)

        self.perform_create(serializer)
        return Response(serializer.data, status=201)

# ================== LOGIN API ==================

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        log_login('admin', user.id, user.username, request)
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
        teacher = Teacher.objects.select_related("course").get(email__iexact=email)

        if _verify_password_and_upgrade(teacher, password):
            # Update last login
            teacher.last_login = timezone.now()
            teacher.save(update_fields=['last_login'])
            
            # Log login
            log_login('teacher', teacher.id, teacher.name, request)
            
            return Response({
                "success": True,
                "teacher_id": teacher.id,
                "name": teacher.name,
                "email": teacher.email,
                "course": teacher.course_id,
                "course_name": teacher.course.name if teacher.course else None,
                "subject": teacher.subject,
                "last_login": teacher.last_login,
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
            # Update last login
            student.last_login = timezone.now()
            student.save(update_fields=['last_login'])
            
            # Log login
            log_login('student', student.id, student.name, request)
            
            return Response({
                "success": True,
                "student_id": student.id,
                "name": student.name,
                "admission_no": student.admission_no,
                "course": student.course_id,
                "course_name": student.course.name if student.course else None,
                "last_login": student.last_login,
            })
        return Response({"success": False, "message": "Invalid credentials"}, status=401)

    except Student.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)


# ================== DASHBOARD STATS API ==================

@api_view(['GET'])
def dashboard_stats(request):
    """Get dashboard statistics for admin"""
    stats = {
        'total_students': Student.objects.count(),
        'total_teachers': Teacher.objects.count(),
        'total_courses': Course.objects.count(),
        'total_fees_collected': Payment.objects.aggregate(total=Sum('amount'))['total'] or 0,
        'total_fees_pending': 0,
        'total_activity_registrations': StudentActivityRegistration.objects.count(),
        'total_salary_paid': TeacherSalaryPayment.objects.aggregate(total=Sum('amount'))['total'] or 0,
        'recent_payments': PaymentSerializer(Payment.objects.all().order_by('-date')[:5], many=True).data,
        'recent_logins': LoginHistorySerializer(LoginHistory.objects.all().order_by('-login_time')[:10], many=True).data,
    }
    
    # Calculate pending fees
    total_fees = Fees.objects.aggregate(total=Sum('total_amount'))['total'] or 0
    total_paid = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
    stats['total_fees_pending'] = max(0, total_fees - total_paid)
    
    return Response(stats)