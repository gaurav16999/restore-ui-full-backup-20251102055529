from admin_api.models import Subject

subjects = Subject.objects.all()
if not subjects.exists():
    print('no subjects')
else:
    for s in subjects:
        print(f"{s.id}\t{s.title}\t{s.is_practical}\t{s.code}")
