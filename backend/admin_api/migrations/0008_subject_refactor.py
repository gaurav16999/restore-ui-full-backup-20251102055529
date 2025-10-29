from django.db import migrations, models


def backfill_subject_codes(apps, schema_editor):
    Subject = apps.get_model('admin_api', 'Subject')

    def make_code(title: str):
        base = ''.join(ch for ch in (title or 'SUBJECT').upper() if ch.isalnum())
        if not base:
            base = 'SUBJECT'
        base = base[:8]
        if not base:
            base = 'SUBJECT'
        return base

    existing_codes = set(
        Subject.objects.exclude(code__isnull=True).values_list('code', flat=True)
    )

    for s in Subject.objects.all():
        if getattr(s, 'code', None):
            continue
        base = make_code(getattr(s, 'title', '') or getattr(s, 'name', '') or '')
        code = base
        i = 1
        while code in existing_codes:
            suffix = f"{i}"
            code = (base[: max(0, 8 - len(suffix))] + suffix)[:8]
            i += 1
        s.code = code
        s.save(update_fields=['code'])
        existing_codes.add(code)


def backfill_subject_codes_reverse(apps, schema_editor):
    # No-op: we won't delete codes on reverse migration
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('admin_api', '0007_class_calendar_type'),
    ]

    operations = [
        # Rename name -> title
        migrations.RenameField(
            model_name='subject',
            old_name='name',
            new_name='title',
        ),

        # Add new fields with permissive defaults first
        migrations.AddField(
            model_name='subject',
            name='code',
            field=models.CharField(max_length=20, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='subject',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='subject',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='subject',
            name='credit_hours',
            field=models.PositiveIntegerField(default=1),
        ),

        # Backfill codes based on title
        migrations.RunPython(backfill_subject_codes, backfill_subject_codes_reverse),

        # Now enforce constraints on code
        migrations.AlterField(
            model_name='subject',
            name='code',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]
