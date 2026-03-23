from django.db import models

# 👨‍🎓 Student Model
class Student(models.Model):
    name = models.CharField(max_length=100)
    student_class = models.CharField(max_length=50)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Students"


# 💰 Fees Model
class Fees(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    total_amount = models.IntegerField()
    paid_amount = models.IntegerField()
    status = models.CharField(max_length=20)

    def __str__(self):
        return self.student.name

    class Meta:
        verbose_name_plural = "Fees"


# 👨‍🏫 Teacher Model
class Teacher(models.Model):
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Teachers"


# 📚 Course Model
class Course(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Courses"


# 📢 Notice Model
class Notice(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()

    # 🔥 NEW
    image = models.ImageField(upload_to='notices/', blank=True, null=True)

    # 🔥 OPTIONAL (highlight notice)
    is_important = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Notices"


# 🖼️ Gallery Model
class Gallery(models.Model):
    image = models.ImageField(upload_to='gallery/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id}"

    class Meta:
        verbose_name_plural = "Gallery"