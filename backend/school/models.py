from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password, identify_hasher


# 📚 Course (Class)
class Course(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    total_periods = models.IntegerField(default=4)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Courses"


# 📘 Subject
class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# 👨‍🎓 Student
class Student(models.Model):
    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)

    # 🔥 NEW FIELDS
    dob = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    parent_name = models.CharField(max_length=100, blank=True, null=True)
    parent_phone = models.CharField(max_length=15, blank=True, null=True)

    details = models.TextField(blank=True, null=True)

    admission_no = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)

    image = models.ImageField(upload_to='students/', blank=True, null=True)

   

    def save(self, *args, **kwargs):
        if self.password:
            try:
                identify_hasher(self.password)
            except:
                self.password = make_password(self.password)
        else:
            if self.pk:
                old = type(self).objects.filter(pk=self.pk).first()
                if old:
                    self.password = old.password

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.course.name})"


# 💰 Fees
class Fees(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)

    total_amount = models.PositiveIntegerField()
    status = models.CharField(max_length=20, default="Pending")

    def update_status(self):
        total_paid = sum(payment.amount for payment in self.payments.all())

        if total_paid >= self.total_amount:
            self.status = "Paid"
        else:
            self.status = "Pending"

        self.save()

    def __str__(self):
        return self.student.name


# 🔥 AUTO CREATE FEES (CORRECT WAY)
@receiver(post_save, sender=Student)
def create_fees(sender, instance, created, **kwargs):
    if created:
        Fees.objects.create(student=instance, total_amount=10000)


class Payment(models.Model):
    fees = models.ForeignKey(Fees, on_delete=models.CASCADE, related_name="payments")

    amount = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True, db_index=True)
    remarks = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.fees.update_status()

    def __str__(self):
        return f"{self.fees.student.name} - ₹{self.amount} - {self.date}"


# 👨‍🏫 Teacher
class Teacher(models.Model):
    name = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(unique=True)

    # 🔥 NEW FIELDS
    dob = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    qualification = models.CharField(max_length=200, blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True)

    password = models.CharField(max_length=255)

    # 🔐 Forgot password
    reset_token = models.CharField(max_length=100, blank=True, null=True)

    details = models.TextField(blank=True, null=True)

    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    image = models.ImageField(upload_to='teachers/', blank=True, null=True)

    # 🔐 HASH PASSWORD
    def save(self, *args, **kwargs):
        if self.password:
            try:
                identify_hasher(self.password)
            except:
                self.password = make_password(self.password)
        else:
            if self.pk:
                old = type(self).objects.filter(pk=self.pk).first()
                if old:
                    self.password = old.password

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# 📅 Attendance
class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True)

    date = models.DateField()
    period = models.IntegerField(default=1)

    status = models.BooleanField()

    class Meta:
        unique_together = ('student', 'date', 'period', 'subject')

    def __str__(self):
        return f"{self.student.name} - {self.date} - P{self.period}"


# 📝 Marks
class Mark(models.Model):
    EXAM_TYPES = (
        ('Unit Test', 'Unit Test'),
        ('Mid Term', 'Mid Term'),
        ('Final', 'Final'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    subject = models.CharField(max_length=100)
    exam_type = models.CharField(max_length=50, choices=EXAM_TYPES)
    marks = models.PositiveIntegerField()
    max_marks = models.PositiveIntegerField(default=100)

    class Meta:
        unique_together = ('student', 'subject', 'exam_type')

    def __str__(self):
        return f"{self.student.name} - {self.subject}"


# 📄 Notes
class Note(models.Model):
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='notes/')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# 📢 Notice
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


# 🖼️ Gallery
class Gallery(models.Model):
    image = models.ImageField(upload_to='gallery/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id}"

    class Meta:
        verbose_name_plural = "Gallery"






