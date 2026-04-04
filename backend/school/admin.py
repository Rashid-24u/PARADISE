from django.contrib import admin
from .models import *

admin.site.register(Student)
admin.site.register(Fees)
admin.site.register(Payment)
admin.site.register(Teacher)
admin.site.register(Course)
admin.site.register(Subject)
admin.site.register(Attendance)
admin.site.register(Mark)
admin.site.register(Note)
admin.site.register(Notice)
admin.site.register(Gallery)

# ✅ ADD THIS
admin.site.register(TeacherSalary)
admin.site.register(TeacherSalaryPayment)