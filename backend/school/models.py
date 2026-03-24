from django.db import models
from django.core.exceptions import ValidationError


# 👨‍🎓 Student Model
class Student(models.Model):
    name = models.CharField(max_length=100)
    student_class = models.CharField(max_length=50)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return f"{self.name} ({self.student_class})"

    class Meta:
        verbose_name_plural = "Students"


# 💰 Fees Model
class Fees(models.Model):
    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE
    )  # 🔥 ONE STUDENT = ONE FEES ONLY

    total_amount = models.PositiveIntegerField()
    paid_amount = models.PositiveIntegerField(default=0)

    status = models.CharField(max_length=20, blank=True)

    def clean(self):
        # 🔥 Prevent negative / invalid
        if self.paid_amount > self.total_amount:
            raise ValidationError("Paid amount cannot exceed total amount")

    def save(self, *args, **kwargs):
        # 🔥 AUTO STATUS CALCULATION
        if self.paid_amount >= self.total_amount:
            self.status = "Paid"
        else:
            self.status = "Pending"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.student.name

    class Meta:
        verbose_name_plural = "Fees"


# 👨‍🏫 Teacher Model
class Teacher(models.Model):
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)

    # 🔥 NEW
    image = models.ImageField(upload_to='teachers/', blank=True, null=True)

    def __str__(self):
        return self.name


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

    image = models.ImageField(upload_to='notices/', blank=True, null=True)
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