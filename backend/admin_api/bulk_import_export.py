"""
Bulk Import/Export functionality for students, teachers, and other entities
"""
import pandas as pd
from io import BytesIO
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from admin_api.models import Student, Teacher, Subject, Grade, ClassRoom
from django.db import transaction

User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def bulk_import_students(request):
    """
    Bulk import students from Excel or CSV file
    Expected columns: first_name, last_name, email, student_id, grade, section, date_of_birth, guardian_name, guardian_phone
    """
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only administrators can import students'},
            status=status.HTTP_403_FORBIDDEN
        )

    file = request.FILES.get('file')
    if not file:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Read file based on extension
        if file.name.endswith('.xlsx') or file.name.endswith('.xls'):
            df = pd.read_excel(file)
        elif file.name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            return Response(
                {'error': 'Unsupported file format. Please upload .xlsx or .csv'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate required columns
        required_columns = [
            'first_name',
            'last_name',
            'email',
            'student_id',
            'grade',
            'section']
        missing_columns = [
            col for col in required_columns if col not in df.columns]
        if missing_columns:
            return Response(
                {'error': f'Missing required columns: {", ".join(missing_columns)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        success_count = 0
        error_count = 0
        errors = []

        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    # Get or create grade
                    grade, _ = Grade.objects.get_or_create(
                        name=str(row['grade']),
                        defaults={'level': index + 1}
                    )

                    # Get or create section (ClassRoom)
                    section, _ = ClassRoom.objects.get_or_create(
                        name=str(row['section']),
                        defaults={'code': str(row['section'])[:10]}
                    )

                    # Create user
                    user, created = User.objects.get_or_create(
                        email=str(row['email']).lower(),
                        defaults={
                            'username': str(row['email']).split('@')[0],
                            'first_name': str(row['first_name']),
                            'last_name': str(row['last_name']),
                            'role': 'student',
                        }
                    )

                    if created:
                        user.set_password('student123')  # Default password
                        user.save()

                    # Create student record
                    student_data = {
                        'user': user,
                        'student_id': str(row['student_id']),
                        'grade': grade,
                        'section': section,
                    }

                    # Add optional fields
                    if 'date_of_birth' in row and pd.notna(
                            row['date_of_birth']):
                        student_data['date_of_birth'] = pd.to_datetime(
                            row['date_of_birth']).date()

                    if 'guardian_name' in row and pd.notna(
                            row['guardian_name']):
                        student_data['guardian_name'] = str(
                            row['guardian_name'])

                    if 'guardian_phone' in row and pd.notna(
                            row['guardian_phone']):
                        student_data['guardian_phone'] = str(
                            row['guardian_phone'])

                    if 'enrollment_date' in row and pd.notna(
                            row['enrollment_date']):
                        student_data['enrollment_date'] = pd.to_datetime(
                            row['enrollment_date']).date()

                    Student.objects.update_or_create(
                        student_id=str(row['student_id']),
                        defaults=student_data
                    )

                    success_count += 1

                except Exception as e:
                    error_count += 1
                    errors.append({
                        'row': index + 2,  # +2 because pandas is 0-indexed and Excel has header
                        'data': row.to_dict(),
                        'error': str(e)
                    })

        return Response({
            'message': f'Import completed. {success_count} students imported successfully.',
            'success_count': success_count,
            'error_count': error_count,
            'errors': errors[:10]  # Return first 10 errors
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Import failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def bulk_import_teachers(request):
    """
    Bulk import teachers from Excel or CSV file
    Expected columns: first_name, last_name, email, employee_id, subject, phone, qualification
    """
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only administrators can import teachers'},
            status=status.HTTP_403_FORBIDDEN
        )

    file = request.FILES.get('file')
    if not file:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Read file
        if file.name.endswith('.xlsx') or file.name.endswith('.xls'):
            df = pd.read_excel(file)
        elif file.name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            return Response(
                {'error': 'Unsupported file format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        required_columns = [
            'first_name',
            'last_name',
            'email',
            'employee_id',
            'subject']
        missing_columns = [
            col for col in required_columns if col not in df.columns]
        if missing_columns:
            return Response(
                {'error': f'Missing required columns: {", ".join(missing_columns)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        success_count = 0
        error_count = 0
        errors = []

        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    # Get or create subject
                    subject, _ = Subject.objects.get_or_create(
                        name=str(row['subject']),
                        defaults={'code': str(row['subject'])[:10].upper()}
                    )

                    # Create user
                    user, created = User.objects.get_or_create(
                        email=str(row['email']).lower(),
                        defaults={
                            'username': str(row['email']).split('@')[0],
                            'first_name': str(row['first_name']),
                            'last_name': str(row['last_name']),
                            'role': 'teacher',
                        }
                    )

                    if created:
                        user.set_password('teacher123')
                        user.save()

                    # Create teacher record
                    teacher_data = {
                        'user': user,
                        'employee_id': str(row['employee_id']),
                        'subject': subject,
                    }

                    if 'phone' in row and pd.notna(row['phone']):
                        teacher_data['phone'] = str(row['phone'])

                    if 'qualification' in row and pd.notna(
                            row['qualification']):
                        teacher_data['qualification'] = str(
                            row['qualification'])

                    if 'experience_years' in row and pd.notna(
                            row['experience_years']):
                        teacher_data['experience_years'] = int(
                            row['experience_years'])

                    Teacher.objects.update_or_create(
                        employee_id=str(row['employee_id']),
                        defaults=teacher_data
                    )

                    success_count += 1

                except Exception as e:
                    error_count += 1
                    errors.append({
                        'row': index + 2,
                        'data': row.to_dict(),
                        'error': str(e)
                    })

        return Response({
            'message': f'Import completed. {success_count} teachers imported successfully.',
            'success_count': success_count,
            'error_count': error_count,
            'errors': errors[:10]
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Import failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_students(request):
    """
    Export all students to Excel file
    """
    if request.user.role not in ['admin', 'teacher']:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        students = Student.objects.select_related(
            'user', 'grade', 'section').all()

        data = []
        for student in students:
            data.append({
                'Student ID': student.student_id,
                'First Name': student.user.first_name,
                'Last Name': student.user.last_name,
                'Email': student.user.email,
                'Grade': student.grade.name if student.grade else '',
                'Section': student.section.name if student.section else '',
                'Date of Birth': student.date_of_birth.strftime('%Y-%m-%d') if student.date_of_birth else '',
                'Enrollment Date': student.enrollment_date.strftime('%Y-%m-%d') if student.enrollment_date else '',
                'Guardian Name': student.guardian_name or '',
                'Guardian Phone': student.guardian_phone or '',
                'Status': 'Active' if student.user.is_active else 'Inactive',
            })

        df = pd.DataFrame(data)

        # Create Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Students')

        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=students_export.xlsx'

        return response

    except Exception as e:
        return Response(
            {'error': f'Export failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_teachers(request):
    """
    Export all teachers to Excel file
    """
    if request.user.role not in ['admin', 'teacher']:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        teachers = Teacher.objects.select_related('user', 'subject').all()

        data = []
        for teacher in teachers:
            data.append({
                'Employee ID': teacher.employee_id,
                'First Name': teacher.user.first_name,
                'Last Name': teacher.user.last_name,
                'Email': teacher.user.email,
                'Subject': teacher.subject.name if teacher.subject else '',
                'Phone': teacher.phone or '',
                'Qualification': teacher.qualification or '',
                'Experience (Years)': teacher.experience_years,
                'Join Date': teacher.join_date.strftime('%Y-%m-%d') if teacher.join_date else '',
                'Status': 'Active' if teacher.user.is_active else 'Inactive',
            })

        df = pd.DataFrame(data)

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Teachers')

        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=teachers_export.xlsx'

        return response

    except Exception as e:
        return Response(
            {'error': f'Export failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_import_template(request, entity_type):
    """
    Download import template (Excel with headers only)
    entity_type: 'students' or 'teachers'
    """
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only administrators can download templates'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        if entity_type == 'students':
            columns = [
                'first_name',
                'last_name',
                'email',
                'student_id',
                'grade',
                'section',
                'date_of_birth',
                'guardian_name',
                'guardian_phone',
                'enrollment_date']
            filename = 'student_import_template.xlsx'

        elif entity_type == 'teachers':
            columns = [
                'first_name', 'last_name', 'email', 'employee_id', 'subject',
                'phone', 'qualification', 'experience_years'
            ]
            filename = 'teacher_import_template.xlsx'

        else:
            return Response(
                {'error': 'Invalid entity type'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create empty DataFrame with columns
        df = pd.DataFrame(columns=columns)

        # Add sample row for guidance
        if entity_type == 'students':
            df.loc[0] = [
                'John', 'Doe', 'john.doe@example.com', 'S001', 'Grade 10', 'A',
                '2008-05-15', 'Jane Doe', '+1234567890', '2024-01-15'
            ]
        else:
            df.loc[0] = [
                'Jane',
                'Smith',
                'jane.smith@example.com',
                'T001',
                'Mathematics',
                '+1234567890',
                'M.Sc. Mathematics',
                '5']

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Template')

        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename={filename}'

        return response

    except Exception as e:
        return Response(
            {'error': f'Template generation failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
