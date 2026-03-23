from django.contrib import admin
from .models import Student, Fees, Teacher, Course, Notice, Gallery

admin.site.register(Student)
admin.site.register(Fees)
admin.site.register(Teacher)
admin.site.register(Course)
admin.site.register(Notice)
admin.site.register(Gallery)