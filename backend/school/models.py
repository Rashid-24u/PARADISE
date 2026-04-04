from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password, identify_hasher
from django.utils import timezone


# 📚 Course (Class)
class Course(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    # REMOVE THIS LINE: total_periods = models.IntegerField(default=4)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Courses"


# 📘 Subject
class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# 🎯 EXTRA ACTIVITY MODEL (NEW)
class ExtraActivity(models.Model):
    name = models.CharField(max_length=100)  # Abacus, Chess, etc.
    description = models.TextField(blank=True, null=True)
    fee_amount = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - ₹{self.fee_amount}"
    
    class Meta:
        verbose_name_plural = "Extra Activities"


# 👨‍🎓 Student
class Student(models.Model):
    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)

    # Personal Fields
    dob = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    parent_name = models.CharField(max_length=100, blank=True, null=True)
    parent_phone = models.CharField(max_length=15, blank=True, null=True)

    # NEW: Subjects field (text input)
    subjects = models.TextField(blank=True, null=True, help_text="Enter subjects separated by commas")

    details = models.TextField(blank=True, null=True)

    admission_no = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    image = models.ImageField(upload_to='students/', blank=True, null=True)
    
    # Login Tracking
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Extra Activities (Many-to-Many)
    extra_activities = models.ManyToManyField(ExtraActivity, through='StudentActivityRegistration', blank=True)

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


# 🎯 STUDENT ACTIVITY REGISTRATION (NEW)
class StudentActivityRegistration(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='activity_registrations')
    activity = models.ForeignKey(ExtraActivity, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Active')  # Active, Completed, Cancelled
    
    # Payment tracking for activity
    total_fee = models.PositiveIntegerField()
    paid_amount = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.student.name} - {self.activity.name}"
    
    def pending_amount(self):
        return self.total_fee - self.paid_amount
    
    def update_status(self):
        if self.paid_amount >= self.total_fee:
            self.status = 'Completed'
        else:
            self.status = 'Active'
        self.save()
    
    class Meta:
        unique_together = ('student', 'activity')
        verbose_name = "Student Activity Registration"
        verbose_name_plural = "Student Activity Registrations"


# 💰 Student Fee Payment for Activity (NEW)
class ActivityPayment(models.Model):
    registration = models.ForeignKey(StudentActivityRegistration, on_delete=models.CASCADE, related_name='payments')
    amount = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True, db_index=True)
    receipt_no = models.CharField(max_length=50, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if not self.receipt_no:
            self.receipt_no = f"ACT{self.registration.id}{self.registration.student.admission_no}{int(self.date.timestamp())}"
            super().save(update_fields=['receipt_no'])

        self.registration.paid_amount += self.amount
        self.registration.save()
        self.registration.update_status()
    
    def __str__(self):
        return f"{self.registration.student.name} - {self.registration.activity.name} - ₹{self.amount}"


# 💰 Student Main Fees
class Fees(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    total_amount = models.PositiveIntegerField()
    status = models.CharField(max_length=20, default="Pending")

    def total_paid(self):
        return sum(payment.amount for payment in self.payments.all())

    def balance(self):
        return self.total_amount - self.total_paid()

    def update_status(self):
        paid = self.total_paid()

        if paid >= self.total_amount:
            self.status = "Paid"
        elif paid > 0:
            self.status = "Partial"
        else:
            self.status = "Pending"

        self.save()

    def __str__(self):
        return self.student.name

@receiver(post_save, sender=Student)
def create_fees(sender, instance, created, **kwargs):
    if created:
        Fees.objects.create(student=instance, total_amount=10000)


class Payment(models.Model):
    fees = models.ForeignKey(Fees, on_delete=models.CASCADE, related_name="payments")
    amount = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True, db_index=True)
    receipt_no = models.CharField(max_length=50, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if not self.receipt_no:
            self.receipt_no = f"FEE{self.fees.student.admission_no}{int(self.date.timestamp())}"
            super().save(update_fields=['receipt_no'])

        self.fees.update_status()

    def __str__(self):
        return f"{self.fees.student.name} - ₹{self.amount} - {self.date}"


# 👨‍🏫 Teacher with Documents
class TeacherDocument(models.Model):
    DOCUMENT_TYPES = (
        ('certificate', 'Certificate'),
        ('qualification', 'Qualification'),
        ('experience', 'Experience Letter'),
        ('id_proof', 'ID Proof'),
        ('other', 'Other'),
    )
    
    teacher = models.ForeignKey('Teacher', on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='teacher_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.teacher.name} - {self.title}"


class Teacher(models.Model):
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=200, blank=True, null=True)  # Changed from ForeignKey to CharField
    created_at = models.DateTimeField(auto_now_add=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(unique=True)

    # Personal Fields
    dob = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # Professional Fields
    qualification = models.TextField(blank=True, null=True)  # Detailed qualification
    experience = models.TextField(blank=True, null=True)  # Detailed experience
    career_details = models.TextField(blank=True, null=True)  # Full career info
    teaching_level = models.CharField(max_length=100, blank=True, null=True)  # PreKG, LKG, UKG, 1-5

    password = models.CharField(max_length=255)
    reset_token = models.CharField(max_length=100, blank=True, null=True)
    details = models.TextField(blank=True, null=True)

    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    image = models.ImageField(upload_to='teachers/', blank=True, null=True)
    
    # Salary Fields
    salary = models.PositiveIntegerField(default=0)  # Monthly salary
    last_login = models.DateTimeField(null=True, blank=True)
    
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


# 💰 TEACHER SALARY MODEL (NEW)
class TeacherSalary(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='salary_records')
    month = models.CharField(max_length=20)
    year = models.IntegerField()
    total_salary = models.PositiveIntegerField()
    paid_amount = models.PositiveIntegerField(default=0)
    pending_amount = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teacher', 'month', 'year')

    def update_status(self):
        self.pending_amount = self.total_salary - self.paid_amount

        if self.paid_amount >= self.total_salary:
            self.status = 'Paid'
        elif self.paid_amount > 0:
            self.status = 'Partial'
        else:
            self.status = 'Pending'

        self.save()

    def save(self, *args, **kwargs):
        self.pending_amount = self.total_salary - self.paid_amount
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.teacher.name} - {self.month} {self.year}"


# 💰 TEACHER SALARY PAYMENT (NEW)
class TeacherSalaryPayment(models.Model):
    salary = models.ForeignKey(TeacherSalary, on_delete=models.CASCADE, related_name='payments')
    amount = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True)
    receipt_no = models.CharField(max_length=50, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if not self.receipt_no:
            self.receipt_no = f"SAL{self.salary.teacher.id}{int(self.date.timestamp())}"
            super().save(update_fields=['receipt_no'])

        self.salary.paid_amount += self.amount
        self.salary.save()
        self.salary.update_status()
    
    def __str__(self):
        return f"{self.salary.teacher.name} - ₹{self.amount} - {self.date}"


# 📅 Attendance (Simplified - One per day per student)
class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.BooleanField(default=True)  # True = Present, False = Absent
    marked_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    marked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')  # Only one attendance per student per day
        ordering = ['-date']

    def __str__(self):
        return f"{self.student.name} - {self.date} - {'Present' if self.status else 'Absent'}"


# 📝 Marks (with text subject)
class Mark(models.Model):
    EXAM_TYPES = (
        ('Unit Test', 'Unit Test'),
        ('Mid Term', 'Mid Term'),
        ('Final', 'Final'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    subject = models.CharField(max_length=100)  # Text input field
    exam_type = models.CharField(max_length=50, choices=EXAM_TYPES)
    marks = models.PositiveIntegerField()
    max_marks = models.PositiveIntegerField(default=100)
    entered_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)

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


# 📊 Reports for Login Tracking (NEW)
class LoginHistory(models.Model):
    USER_TYPES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES)
    user_id = models.IntegerField()
    user_name = models.CharField(max_length=100)
    login_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-login_time']
        verbose_name_plural = "Login Histories"
    
    def __str__(self):
        return f"{self.user_name} ({self.user_type}) - {self.login_time}"