from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("school", "0008_alter_teacher_course_blank"),
    ]

    operations = [
        migrations.AddField(
            model_name="mark",
            name="max_marks",
            field=models.PositiveIntegerField(default=100),
        ),
    ]
