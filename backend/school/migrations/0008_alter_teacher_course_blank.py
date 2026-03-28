# Generated manually: Teacher.course blank=True (optional in forms/API)

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("school", "0007_mark_created_at_note_created_at_student_created_at_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="teacher",
            name="course",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="school.course",
            ),
        ),
    ]
