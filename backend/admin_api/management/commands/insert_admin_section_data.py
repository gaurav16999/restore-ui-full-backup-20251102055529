from django.core.management.base import BaseCommand
from admin_api.models import AdmissionQuery, VisitorBook, Complaint, PostalReceive, PostalDispatch, PhoneCallLog
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Insert sample data for Admin Section'

    def handle(self, *args, **kwargs):
        self.stdout.write('Inserting Admin Section sample data...')

        # Create Admission Queries
        admission_queries = [{'name': 'John Fernandes',
                              'phone': '08890478981',
                              'email': 'john.fernandes@email.com',
                              'source': 'Facebook',
                              'query_date': timezone.now().date() - timedelta(days=6),
                              'status': 'Pending',
                              'description': 'Interested in admission for grade 5',
                              'next_follow_up_date': timezone.now().date() + timedelta(days=1),
                              'assigned': 'Admin',
                              'class_field': 'Grade 5'},
                             {'name': 'Sarah Williams',
                              'phone': '08901234567',
                              'email': 'sarah.williams@email.com',
                              'source': 'Website',
                              'query_date': timezone.now().date() - timedelta(days=5),
                              'status': 'Follow Up',
                              'description': 'Looking for nursery admission',
                              'next_follow_up_date': timezone.now().date(),
                              'assigned': 'Admin',
                              'class_field': 'Nursery'},
                             {'name': 'Michael Johnson',
                              'phone': '08912345678',
                              'email': 'michael.j@email.com',
                              'source': 'Google',
                              'query_date': timezone.now().date() - timedelta(days=4),
                              'status': 'Contacted',
                              'description': 'Inquiry about grade 8 admission',
                              'next_follow_up_date': timezone.now().date() + timedelta(days=3),
                              'assigned': 'Admin',
                              'class_field': 'Grade 8'},
                             {'name': 'Emily Davis',
                              'phone': '08923456789',
                              'email': 'emily.davis@email.com',
                              'source': 'Referral',
                              'query_date': timezone.now().date() - timedelta(days=3),
                              'status': 'Converted',
                              'description': 'Admission for twin children grade 3',
                              'assigned': 'Admin',
                              'class_field': 'Grade 3',
                              'number_of_child': 2},
                             {'name': 'David Martinez',
                              'phone': '08934567890',
                              'email': 'david.martinez@email.com',
                              'source': 'Facebook',
                              'query_date': timezone.now().date() - timedelta(days=2),
                              'status': 'Pending',
                              'description': 'Interested in sports program',
                              'next_follow_up_date': timezone.now().date() + timedelta(days=2),
                              'assigned': 'Admin',
                              'class_field': 'Grade 6'},
                             ]

        for query_data in admission_queries:
            AdmissionQuery.objects.get_or_create(
                name=query_data['name'],
                phone=query_data['phone'],
                defaults=query_data
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {
                    len(admission_queries)} admission queries'))

        # Create Visitor Book entries
        visitor_entries = [
            {
                'purpose': 'Admission Inquiry',
                'name': 'James Brown',
                'phone': '08945678901',
                'no_of_person': 2,
                'date': timezone.now().date(),
                'in_time': '09:30:00',
                'out_time': '10:15:00'
            },
            {
                'purpose': 'Parent Meeting',
                'name': 'Lisa Anderson',
                'phone': '08956789012',
                'no_of_person': 1,
                'date': timezone.now().date(),
                'in_time': '11:00:00',
                'out_time': '11:45:00'
            },
            {
                'purpose': 'Delivery',
                'name': 'Express Courier',
                'phone': '08967890123',
                'no_of_person': 1,
                'date': timezone.now().date() - timedelta(days=1),
                'in_time': '14:00:00',
                'out_time': '14:10:00'
            },
        ]

        for visitor in visitor_entries:
            VisitorBook.objects.get_or_create(
                name=visitor['name'],
                date=visitor['date'],
                in_time=visitor['in_time'],
                defaults=visitor
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {
                    len(visitor_entries)} visitor entries'))

        # Create Complaints
        complaints = [
            {
                'complaint_by': 'Parent - Tom Wilson',
                'complaint_type': 'Transport',
                'source': 'Phone',
                'phone': '08978901234',
                'date': timezone.now().date() - timedelta(days=2),
                'description': 'School bus late by 30 minutes daily',
                'status': 'In Progress'
            },
            {
                'complaint_by': 'Student - Alice Cooper',
                'complaint_type': 'Facilities',
                'source': 'In Person',
                'phone': '08989012345',
                'date': timezone.now().date() - timedelta(days=1),
                'description': 'Library books shortage',
                'status': 'Resolved'
            },
        ]

        for complaint in complaints:
            Complaint.objects.get_or_create(
                complaint_by=complaint['complaint_by'],
                date=complaint['date'],
                defaults=complaint
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {
                    len(complaints)} complaints'))

        # Create Postal Receive records
        postal_receives = [
            {
                'from_title': 'Education Board',
                'reference_no': 'EB/2025/001',
                'address': '123 Board Office, City Center',
                'to_title': 'Principal Office',
                'date': timezone.now().date() - timedelta(days=3)
            },
            {
                'from_title': 'Book Publisher',
                'reference_no': 'BP/2025/042',
                'address': '456 Publisher Street',
                'to_title': 'Library Department',
                'date': timezone.now().date() - timedelta(days=1)
            },
        ]

        for postal in postal_receives:
            PostalReceive.objects.get_or_create(
                reference_no=postal['reference_no'],
                defaults=postal
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {
                    len(postal_receives)} postal receive records'))

        # Create Postal Dispatch records
        postal_dispatches = [
            {
                'to_title': 'District Education Office',
                'reference_no': 'SCH/2025/015',
                'address': '789 District Office Road',
                'from_title': 'Administration',
                'date': timezone.now().date() - timedelta(days=2)
            },
        ]

        for postal in postal_dispatches:
            PostalDispatch.objects.get_or_create(
                reference_no=postal['reference_no'],
                defaults=postal
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {
                    len(postal_dispatches)} postal dispatch records'))

        # Create Phone Call Logs
        phone_logs = [{'name': 'Robert Taylor',
                       'phone': '08990123456',
                       'date': timezone.now().date(),
                       'call_duration': '15 minutes',
                       'call_type': 'Incoming',
                       'description': 'Inquiry about admission process and fees'},
                      {'name': 'Jennifer White',
                       'phone': '08901234567',
                       'date': timezone.now().date() - timedelta(days=1),
                       'call_duration': '8 minutes',
                       'call_type': 'Outgoing',
                       'description': 'Follow-up with parent regarding student performance'},
                      ]

        for log in phone_logs:
            PhoneCallLog.objects.get_or_create(
                name=log['name'],
                phone=log['phone'],
                date=log['date'],
                defaults=log
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created {
                    len(phone_logs)} phone call logs'))

        self.stdout.write(self.style.SUCCESS(
            '✅ All Admin Section sample data inserted successfully!'))
