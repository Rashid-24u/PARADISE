from rest_framework import serializers
from .models import *


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


# 🎯 Extra Activity Serializers (NEW)
class ExtraActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraActivity
        fields = '__all__'


class StudentActivityRegistrationSerializer(serializers.ModelSerializer):
    activity_name = serializers.CharField(source='activity.name', read_only=True)
    activity_fee = serializers.IntegerField(source='activity.fee_amount', read_only=True)
    pending = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentActivityRegistration
        fields = '__all__'
    
    def get_pending(self, obj):
        return obj.pending_amount()
    
    def create(self, validated_data):
        # Auto set total_fee from activity
        activity = validated_data.get('activity')
        if activity and not validated_data.get('total_fee'):
            validated_data['total_fee'] = activity.fee_amount
        return super().create(validated_data)


class ActivityPaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='registration.student.name', read_only=True)
    activity_name = serializers.CharField(source='registration.activity.name', read_only=True)

    class Meta:
        model = ActivityPayment
        fields = '__all__'


# 👨‍🎓 STUDENT
class StudentSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    course_name = serializers.CharField(source="course.name", read_only=True)
    total_fees_paid = serializers.SerializerMethodField()
    total_fees_pending = serializers.SerializerMethodField()
    total_activity_fees_paid = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = "__all__"
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": False,
                "allow_blank": True,
                "trim_whitespace": False,
            }
        }

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_total_fees_paid(self, obj):
        if hasattr(obj, 'fees'):
            return sum(p.amount for p in obj.fees.payments.all())
        return 0

    def get_total_fees_pending(self, obj):
        if hasattr(obj, 'fees'):
            total = obj.fees.total_amount
            paid = sum(p.amount for p in obj.fees.payments.all())
            return total - paid
        return 0
    
    def get_total_activity_fees_paid(self, obj):
        total = 0
        for reg in obj.activity_registrations.all():
            total += reg.paid_amount
        return total

    def create(self, validated_data):
        pw = validated_data.get("password")
        if not pw or not str(pw).strip():
            raise serializers.ValidationError(
                {"password": "This field is required when creating a student."}
            )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        pw = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if pw:
            instance.password = pw
            instance.save(update_fields=["password"])
        return instance


# 👨‍🏫 TEACHER with Documents
# 👨‍🏫 TEACHER with Documents
class TeacherDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TeacherDocument
        fields = '__all__'
    
    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None


class TeacherSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    course_name = serializers.CharField(source="course.name", read_only=True)
    documents = TeacherDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Teacher
        exclude = ["reset_token"]
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": False,
                "allow_blank": True,
                "trim_whitespace": False,
            }
        }

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        
        # Extract password
        password = validated_data.pop('password', None)
        
        # Create teacher instance
        teacher = Teacher.objects.create(**validated_data)
        
        # Set password if provided
        if password:
            teacher.password = password
            teacher.save()
        
        # Handle multiple document uploads
        if request:
            # Get all files and their metadata from the request
            documents = request.FILES.getlist('documents')
            document_types = request.POST.getlist('document_types')
            document_titles = request.POST.getlist('document_titles')
            
            print(f"Received {len(documents)} documents")  # Debug log
            
            for i in range(len(documents)):
                doc_type = document_types[i] if i < len(document_types) else 'other'
                doc_title = document_titles[i] if i < len(document_titles) else f"Document {i+1}"
                
                TeacherDocument.objects.create(
                    teacher=teacher,
                    document_type=doc_type,
                    title=doc_title,
                    file=documents[i]
                )
                print(f"Created document: {doc_title}")  # Debug log
        
        return teacher

    def update(self, instance, validated_data):
        request = self.context.get('request')
        password = validated_data.pop('password', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.password = password
        
        instance.save()
        
        # Handle new document uploads during update
        if request:
            documents = request.FILES.getlist('documents')
            document_types = request.POST.getlist('document_types')
            document_titles = request.POST.getlist('document_titles')
            
            print(f"Updating with {len(documents)} new documents")  # Debug log
            
            for i in range(len(documents)):
                doc_type = document_types[i] if i < len(document_types) else 'other'
                doc_title = document_titles[i] if i < len(document_titles) else f"Document {i+1}"
                
                TeacherDocument.objects.create(
                    teacher=instance,
                    document_type=doc_type,
                    title=doc_title,
                    file=documents[i]
                )
                print(f"Created new document: {doc_title}")  # Debug log
        
        return instance

# 💰 Teacher Salary Serializers (NEW)
class TeacherSalarySerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    payments = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()   # ✅ ADD

    class Meta:
        model = TeacherSalary
        fields = '__all__'

    def get_payments(self, obj):
        return TeacherSalaryPaymentSerializer(
            obj.payments.all(), many=True, context=self.context
        ).data   # ✅ context added

    def get_balance(self, obj):   # ✅ ADD
        return obj.total_salary - obj.paid_amount



class TeacherSalaryPaymentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='salary.teacher.name', read_only=True)

    class Meta:
        model = TeacherSalaryPayment
        fields = '__all__'


# 💰 FEES
class FeesSerializer(serializers.ModelSerializer):
    total_paid = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()   # ✅ ADD THIS
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_admission = serializers.CharField(source='student.admission_no', read_only=True)

    class Meta:
        model = Fees
        fields = '__all__'

    def get_total_paid(self, obj):
        return sum(p.amount for p in obj.payments.all())

    def get_balance(self, obj):   # ✅ ADD THIS
        return obj.total_amount - self.get_total_paid(obj)

# 💳 PAYMENT
class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='fees.student.name', read_only=True)
    student_admission = serializers.CharField(source='fees.student.admission_no', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'


# 📅 ATTENDANCE (Simplified)
class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher_name = serializers.CharField(source='marked_by.name', read_only=True)  # NEW

    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ['marked_at']

    def validate(self, attrs):
        student = attrs.get('student')
        date = attrs.get('date')
        
        # For update operations, skip duplicate check for the same record
        if self.instance is None:
            if Attendance.objects.filter(student=student, date=date).exists():
                raise serializers.ValidationError(
                    {"date": f"Attendance already marked for {student.name} on {date}"}
                )
        return attrs
    
    def update(self, instance, validated_data):
        # Update status and marked_by
        instance.status = validated_data.get('status', instance.status)
        instance.marked_by = validated_data.get('marked_by', instance.marked_by)
        instance.save()
        return instance

# 📝 MARKS
class MarkSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    
    class Meta:
        model = Mark
        fields = "__all__"
        extra_kwargs = {
            "max_marks": {"required": False},
        }

    def validate(self, attrs):
        subj = attrs.get("subject")
        if isinstance(subj, str):
            attrs = dict(attrs)
            attrs["subject"] = subj.strip()
            if not attrs["subject"]:
                raise serializers.ValidationError(
                    {"subject": "Subject cannot be empty."}
                )

        marks = attrs.get("marks")
        if marks is None and self.instance is not None:
            marks = self.instance.marks

        if marks is not None and marks < 0:
            raise serializers.ValidationError(
                {"marks": "Marks cannot be negative."}
            )

        max_m = attrs.get("max_marks")
        if max_m is None:
            if self.instance is not None:
                max_m = self.instance.max_marks
            else:
                max_m = 100

        if max_m is not None and max_m < 1:
            raise serializers.ValidationError(
                {"max_marks": "Out of (max marks) must be at least 1."}
            )

        if marks is not None and max_m is not None and marks > max_m:
            raise serializers.ValidationError(
                {"marks": f"Marks cannot exceed max_marks ({max_m})."}
            )
        return attrs


# 📄 NOTES
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'


# 📢 NOTICE
class NoticeSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Notice
        fields = '__all__'

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


# 🖼️ GALLERY
class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = '__all__'


# 📊 Login History Serializer (NEW)
class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = '__all__'
