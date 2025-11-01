from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from admin_api.models import Student
from admin_api.serializers.student import StudentSerializer, StudentCreateSerializer
from users.models import User
import pandas as pd
import random
import string
from django.db import transaction
from django.http import HttpResponse
import csv


class StudentListView(generics.ListAPIView):
    queryset = Student.objects.all().select_related('user')
    serializer_class = StudentSerializer


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all().select_related('user')
    serializer_class = StudentSerializer


class StudentCreateView(generics.CreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentCreateSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print(f"Error creating student: {e}")
            traceback.print_exc()
            return Response(
                {'error': str(e), 'detail': 'Failed to create student'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentStatsView(generics.RetrieveAPIView):
    def get(self, request):
        total_students = Student.objects.count()
        active_students = Student.objects.filter(is_active=True).count()
        # For now, using dummy data for new_this_month and avg_attendance
        # In a real app, you'd calculate these based on created_at dates and
        # attendance records
        return Response({
            'total': total_students,
            'active': active_students,
            # Dummy calculation
            'new_this_month': max(0, total_students // 10),
            'avg_attendance': '85%',  # Dummy value
        })


class StudentImportView(APIView):
    """
    View to handle Excel file upload and bulk student import
    """
    parser_classes = (MultiPartParser, FormParser)

    def generate_student_id(self):
        """Generate unique student ID with format STU-XXXXXXXX"""
        while True:
            # Generate 8 random alphanumeric characters
            random_chars = ''.join(
                random.choices(
                    string.ascii_uppercase +
                    string.digits,
                    k=8))
            student_id = f"STU-{random_chars}"

            # Check if this ID already exists
            if not Student.objects.filter(roll_no=student_id).exists():
                return student_id

    def generate_email(self, first_name, last_name):
        """Generate email from name in format firstname.lastname@school.edu"""
        # Clean names (remove special characters, convert to lowercase)
        first_clean = ''.join(c.lower() for c in first_name if c.isalnum())
        last_clean = ''.join(c.lower() for c in last_name if c.isalnum())

        base_email = f"{first_clean}.{last_clean}@school.edu"

        # Check if email exists, add number suffix if needed
        email = base_email
        counter = 1
        while User.objects.filter(email=email).exists():
            email = f"{first_clean}.{last_clean}{counter}@school.edu"
            counter += 1

        return email

    def generate_password(self, length=10):
        """Generate random password with letters and digits"""
        chars = string.ascii_letters + string.digits
        return ''.join(random.choices(chars, k=length))

    def post(self, request):
        try:
            if 'file' not in request.FILES:
                return Response(
                    {'error': 'No file uploaded'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            file = request.FILES['file']

            # Validate file extension
            if not file.name.endswith(('.xlsx', '.xls')):
                return Response(
                    {'error': 'Please upload an Excel file (.xlsx or .xls)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Read Excel file
            try:
                df = pd.read_excel(file)
            except Exception as e:
                return Response(
                    {'error': f'Error reading Excel file: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate required columns
            required_columns = ['Name', 'Class']
            missing_columns = [
                col for col in required_columns if col not in df.columns]

            if missing_columns:
                return Response(
                    {
                        'error': f'Missing required columns: {
                            ", ".join(missing_columns)}. Required: Name, Class. Optional: Age, Email'},
                    status=status.HTTP_400_BAD_REQUEST)

            # Process students data
            students_data = []
            credentials_data = []
            errors = []

            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        # Extract name parts
                        full_name = str(row['Name']).strip()
                        if not full_name or full_name.lower() == 'nan':
                            errors.append(f'Row {index + 2}: Name is required')
                            continue

                        # Split name into first and last name
                        name_parts = full_name.split()
                        if len(name_parts) == 1:
                            first_name = name_parts[0]
                            last_name = 'Student'  # Default last name
                        else:
                            first_name = name_parts[0]
                            last_name = ' '.join(name_parts[1:])

                        # Get class
                        class_name = str(row['Class']).strip()
                        if not class_name or class_name.lower() == 'nan':
                            errors.append(
                                f'Row {
                                    index +
                                    2}: Class is required')
                            continue

                        # Generate student ID
                        student_id = self.generate_student_id()

                        # Get or generate email
                        email = None
                        if 'Email' in row and pd.notna(row['Email']):
                            email = str(row['Email']).strip()
                            # Validate email format
                            if '@' not in email:
                                email = self.generate_email(
                                    first_name, last_name)
                        else:
                            email = self.generate_email(first_name, last_name)

                        # Check if email already exists
                        if User.objects.filter(email=email).exists():
                            email = self.generate_email(first_name, last_name)

                        # Generate password
                        password = self.generate_password()

                        # Get age if provided
                        if 'Age' in row and pd.notna(row['Age']):
                            try:
                                int(row['Age'])
                            except (ValueError, TypeError):
                                pass

                        # Create User
                        user = User.objects.create_user(
                            username=student_id,
                            email=email,
                            first_name=first_name,
                            last_name=last_name,
                            password=password,
                            role='student'
                        )

                        # Create Student
                        student = Student.objects.create(
                            user=user,
                            roll_no=student_id,
                            class_name=class_name,
                            phone='',  # Default empty phone
                            is_active=True
                        )

                        students_data.append({
                            'id': student.id,
                            'name': full_name,
                            'student_id': student_id,
                            'class': class_name,
                            'email': email
                        })

                        credentials_data.append({
                            'Student ID': student_id,
                            'Name': full_name,
                            'Class': class_name,
                            'Email': email,
                            'Password': password
                        })

                    except Exception as e:
                        errors.append(f'Row {index + 2}: {str(e)}')
                        continue

            if errors and not students_data:
                return Response(
                    {'error': 'No students could be imported', 'details': errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Store credentials in session for download (optional)
            request.session['import_credentials'] = credentials_data

            response_data = {
                'message': f'Successfully imported {
                    len(students_data)} students',
                'imported_students': students_data,
                'total_imported': len(students_data)}

            if errors:
                response_data['warnings'] = errors
                response_data['message'] += f' with {len(errors)} warnings'

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Import failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentCredentialsDownloadView(APIView):
    """
    View to download imported student credentials as CSV
    """

    def get(self, request):
        try:
            credentials_data = request.session.get('import_credentials', [])

            if not credentials_data:
                return Response(
                    {'error': 'No credentials data available for download'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Create CSV response
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="student_credentials.csv"'

            # Create CSV writer
            writer = csv.DictWriter(
                response,
                fieldnames=[
                    'Student ID',
                    'Name',
                    'Class',
                    'Email',
                    'Password'])
            writer.writeheader()

            for credential in credentials_data:
                writer.writerow(credential)

            # Clear credentials from session after download
            del request.session['import_credentials']

            return response

        except Exception as e:
            return Response(
                {'error': f'Download failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
