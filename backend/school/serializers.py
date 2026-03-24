from rest_framework import serializers
from .models import Student, Fees, Teacher, Course, Notice, Gallery


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'


class FeesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fees
        fields = '__all__'


class TeacherSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = '__all__'

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def update(self, instance, validated_data):
        # 🔥 KEEP OLD IMAGE
        if not validated_data.get('image'):
            validated_data['image'] = instance.image
        return super().update(instance, validated_data)


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


from rest_framework import serializers
from .models import Notice

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

    def update(self, instance, validated_data):
        # 🔥 KEEP OLD IMAGE
        if not validated_data.get('image'):
            validated_data['image'] = instance.image

        return super().update(instance, validated_data)


class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = '__all__'