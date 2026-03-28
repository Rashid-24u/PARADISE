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


# 👨‍🎓 STUDENT
class StudentSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    course_name = serializers.CharField(source="course.name", read_only=True)

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


# 👨‍🏫 TEACHER
class TeacherSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    course_name = serializers.CharField(source="course.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)

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
        pw = validated_data.get("password")
        if not pw or not str(pw).strip():
            raise serializers.ValidationError(
                {"password": "This field is required when creating a teacher."}
            )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        pw = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if pw:
            instance.password = pw
            instance.save(update_fields=["password"])
        return instance


# 💰 FEES
class FeesSerializer(serializers.ModelSerializer):
    total_paid = serializers.SerializerMethodField()

    class Meta:
        model = Fees
        fields = '__all__'

    def get_total_paid(self, obj):
        return sum(p.amount for p in obj.payments.all())


# 💳 PAYMENT
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


# 📅 ATTENDANCE
class AttendanceSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.CharField(source="teacher.name", read_only=True)
    # Explicit FK/period so DRF never merges required=True with empty default (500).
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        required=True,
        allow_null=False,
    )
    period = serializers.IntegerField(required=False, default=1, min_value=1)

    class Meta:
        model = Attendance
        fields = "__all__"

    def validate(self, attrs):
        if not self.instance and "status" not in attrs:
            raise serializers.ValidationError({"status": "This field is required."})
        return attrs


# 📝 MARKS
class MarkSerializer(serializers.ModelSerializer):
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
                st = attrs.get("student")
                sub = attrs.get("subject")
                ex = attrs.get("exam_type")
                if st is not None and sub and ex:
                    existing = (
                        Mark.objects.filter(
                            student=st, subject=sub, exam_type=ex
                        )
                        .only("max_marks")
                        .first()
                    )
                    max_m = existing.max_marks if existing else 100
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