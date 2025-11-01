"""
Phase 4 - Advanced Reports & Analytics Views
Comprehensive reporting system for students, classes, attendance, and fees
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Sum, Q, F, Max, Min
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

from admin_api.models import (
    Student, Enrollment, Attendance, Grade, ExamResult, Exam,
    FeePayment, FeeStructure, Teacher, ClassRoom, Subject,
    Assignment, AssignmentSubmission, LeaveApplication,
    Employee, StaffAttendance, Payslip
)

from users.models import User


class AdvancedReportsViewSet(viewsets.ViewSet):
    """Advanced reporting and analytics endpoints"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def student_performance(self, request):
        """
        Comprehensive student performance report
        Query params: student_id (required), period (month/semester/year)
        """
        student_id = request.query_params.get('student_id')
        period = request.query_params.get('period', 'year')  # month, semester, year
        
        if not student_id:
            return Response(
                {'error': 'student_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            student = Student.objects.select_related('user').get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get enrollment to determine class
        enrollment = Enrollment.objects.filter(
            student=student,
            is_active=True
        ).select_related('classroom').first()
        
        if not enrollment:
            return Response({
                'error': 'Student not enrolled in any class'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate date range based on period
        today = timezone.now().date()
        if period == 'month':
            start_date = today.replace(day=1)
        elif period == 'semester':
            # Assume semester is 6 months
            start_date = today - timedelta(days=180)
        else:  # year
            start_date = today.replace(month=1, day=1)
        
        # Get grades for period
        grades = Grade.objects.filter(
            student=student,
            created_at__date__gte=start_date
        ).select_related('subject')
        
        # Calculate subject-wise performance
        subject_performance = []
        for subject in Subject.objects.filter(
            classroom=enrollment.classroom
        ):
            subject_grades = grades.filter(subject=subject)
            if subject_grades.exists():
                avg_grade = subject_grades.aggregate(
                    avg=Avg('marks')
                )['avg'] or 0
                
                # Get class average for comparison
                class_avg = Grade.objects.filter(
                    subject=subject,
                    student__enrollment__classroom=enrollment.classroom,
                    created_at__date__gte=start_date
                ).aggregate(avg=Avg('marks'))['avg'] or 0
                
                subject_performance.append({
                    'subject_id': subject.id,
                    'subject_name': subject.name,
                    'average_marks': round(float(avg_grade), 2),
                    'class_average': round(float(class_avg), 2),
                    'difference': round(float(avg_grade - class_avg), 2),
                    'total_assessments': subject_grades.count(),
                    'highest_marks': subject_grades.aggregate(
                        max=Max('marks')
                    )['max'] or 0,
                    'lowest_marks': subject_grades.aggregate(
                        min=Min('marks')
                    )['min'] or 0
                })
        
        # Get exam results
        exam_results = ExamResult.objects.filter(
            student=student,
            created_at__gte=start_date
        ).select_related('exam', 'subject')
        
        exams_data = []
        for result in exam_results:
            exams_data.append({
                'exam_id': result.exam.id,
                'exam_name': result.exam.name,
                'exam_date': result.exam.exam_date,
                'subject_name': result.subject.name,
                'marks_obtained': float(result.marks_obtained),
                'total_marks': float(result.total_marks),
                'percentage': round((float(result.marks_obtained) / float(result.total_marks)) * 100, 2),
                'grade': result.grade if hasattr(result, 'grade') else None
            })
        
        # Calculate overall average
        overall_avg = grades.aggregate(avg=Avg('marks'))['avg'] or 0
        class_overall_avg = Grade.objects.filter(
            student__enrollment__classroom=enrollment.classroom,
            created_at__date__gte=start_date
        ).aggregate(avg=Avg('marks'))['avg'] or 0
        
        # Get attendance for period
        attendance_records = Attendance.objects.filter(
            student=student,
            date__gte=start_date
        )
        total_days = attendance_records.count()
        present_days = attendance_records.filter(status='present').count()
        attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
        
        # Get class rank
        class_students = Student.objects.filter(
            enrollment__classroom=enrollment.classroom,
            enrollment__is_active=True
        )
        student_averages = []
        for s in class_students:
            s_avg = Grade.objects.filter(
                student=s,
                created_at__date__gte=start_date
            ).aggregate(avg=Avg('marks'))['avg'] or 0
            student_averages.append((s.id, s_avg))
        
        student_averages.sort(key=lambda x: x[1], reverse=True)
        rank = next((i + 1 for i, (sid, _) in enumerate(student_averages) if sid == student.id), None)
        
        # Get assignment completion rate
        class_assignments = Assignment.objects.filter(
            classroom=enrollment.classroom,
            due_date__gte=start_date
        )
        submitted_assignments = AssignmentSubmission.objects.filter(
            assignment__in=class_assignments,
            student=student
        ).count()
        assignment_completion = (submitted_assignments / class_assignments.count() * 100) if class_assignments.count() > 0 else 0
        
        return Response({
            'student': {
                'id': student.id,
                'name': student.user.get_full_name(),
                'email': student.user.email,
                'class': enrollment.classroom.name if enrollment.classroom else None,
                'roll_number': student.roll_number if hasattr(student, 'roll_number') else None
            },
            'period': period,
            'date_range': {
                'start': start_date,
                'end': today
            },
            'overall_performance': {
                'average_marks': round(float(overall_avg), 2),
                'class_average': round(float(class_overall_avg), 2),
                'rank': rank,
                'total_students': len(student_averages),
                'percentile': round(((len(student_averages) - rank + 1) / len(student_averages)) * 100, 2) if rank else 0
            },
            'subject_performance': subject_performance,
            'exam_results': exams_data,
            'attendance': {
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': total_days - present_days,
                'percentage': round(attendance_percentage, 2)
            },
            'assignment_completion': {
                'total_assignments': class_assignments.count(),
                'submitted': submitted_assignments,
                'completion_rate': round(assignment_completion, 2)
            }
        })
    
    @action(detail=False, methods=['get'])
    def class_analytics(self, request):
        """
        Class performance analytics
        Query params: class_id (required), subject_id (optional)
        """
        class_id = request.query_params.get('class_id')
        subject_id = request.query_params.get('subject_id')
        
        if not class_id:
            return Response(
                {'error': 'class_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            classroom = ClassRoom.objects.get(id=class_id)
        except ClassRoom.DoesNotExist:
            return Response(
                {'error': 'Class not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all students in class
        enrollments = Enrollment.objects.filter(
            classroom=classroom,
            is_active=True
        ).select_related('student__user')
        
        total_students = enrollments.count()
        
        # Get grades query
        grades_query = Grade.objects.filter(
            student__enrollment__classroom=classroom,
            student__enrollment__is_active=True
        )
        
        if subject_id:
            grades_query = grades_query.filter(subject_id=subject_id)
        
        # Calculate class statistics
        class_stats = grades_query.aggregate(
            average=Avg('marks'),
            highest=Max('marks'),
            lowest=Min('marks'),
            total_assessments=Count('id')
        )
        
        # Get subject-wise performance
        subjects = Subject.objects.filter(classroom=classroom)
        subject_stats = []
        
        for subject in subjects:
            subject_grades = Grade.objects.filter(
                student__enrollment__classroom=classroom,
                subject=subject
            )
            
            if subject_grades.exists():
                avg_marks = subject_grades.aggregate(avg=Avg('marks'))['avg'] or 0
                
                # Grade distribution
                excellent = subject_grades.filter(marks__gte=90).count()
                good = subject_grades.filter(marks__gte=75, marks__lt=90).count()
                average = subject_grades.filter(marks__gte=60, marks__lt=75).count()
                below_average = subject_grades.filter(marks__lt=60).count()
                
                subject_stats.append({
                    'subject_id': subject.id,
                    'subject_name': subject.name,
                    'average_marks': round(float(avg_marks), 2),
                    'total_assessments': subject_grades.count(),
                    'highest_marks': subject_grades.aggregate(max=Max('marks'))['max'] or 0,
                    'lowest_marks': subject_grades.aggregate(min=Min('marks'))['min'] or 0,
                    'grade_distribution': {
                        'excellent': excellent,  # 90+
                        'good': good,            # 75-89
                        'average': average,      # 60-74
                        'below_average': below_average  # <60
                    }
                })
        
        # Get top 10 performers
        student_averages = []
        for enrollment in enrollments:
            avg = Grade.objects.filter(
                student=enrollment.student
            ).aggregate(avg=Avg('marks'))['avg'] or 0
            
            student_averages.append({
                'student_id': enrollment.student.id,
                'student_name': enrollment.student.user.get_full_name(),
                'average_marks': round(float(avg), 2)
            })
        
        student_averages.sort(key=lambda x: x['average_marks'], reverse=True)
        top_performers = student_averages[:10]
        below_average_students = [s for s in student_averages if s['average_marks'] < 60]
        
        # Attendance statistics
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        attendance_records = Attendance.objects.filter(
            student__enrollment__classroom=classroom,
            date__gte=month_start
        )
        
        total_attendance_days = attendance_records.values('date').distinct().count()
        present_count = attendance_records.filter(status='present').count()
        class_attendance_rate = (present_count / (total_students * total_attendance_days) * 100) if total_attendance_days > 0 else 0
        
        return Response({
            'class': {
                'id': classroom.id,
                'name': classroom.name,
                'total_students': total_students
            },
            'overall_statistics': {
                'average_marks': round(float(class_stats['average'] or 0), 2),
                'highest_marks': class_stats['highest'] or 0,
                'lowest_marks': class_stats['lowest'] or 0,
                'total_assessments': class_stats['total_assessments'] or 0,
                'attendance_rate': round(class_attendance_rate, 2)
            },
            'subject_statistics': subject_stats,
            'top_performers': top_performers,
            'below_average_students': below_average_students,
            'grade_distribution': {
                'excellent': grades_query.filter(marks__gte=90).count(),
                'good': grades_query.filter(marks__gte=75, marks__lt=90).count(),
                'average': grades_query.filter(marks__gte=60, marks__lt=75).count(),
                'below_average': grades_query.filter(marks__lt=60).count()
            }
        })
    
    @action(detail=False, methods=['get'])
    def attendance_summary(self, request):
        """
        Attendance report for students or staff
        Query params: start_date, end_date, student_id, class_id, teacher_id
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        student_id = request.query_params.get('student_id')
        class_id = request.query_params.get('class_id')
        teacher_id = request.query_params.get('teacher_id')
        
        today = timezone.now().date()
        
        # Default to current month if no dates provided
        if not start_date:
            start_date = today.replace(day=1)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        
        if not end_date:
            end_date = today
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        if teacher_id:
            # Staff attendance report
            try:
                employee = Employee.objects.get(id=teacher_id)
            except Employee.DoesNotExist:
                return Response(
                    {'error': 'Employee not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            attendance_records = StaffAttendance.objects.filter(
                employee=employee,
                date__gte=start_date,
                date__lte=end_date
            )
            
            total_days = attendance_records.count()
            present_days = attendance_records.filter(status='present').count()
            absent_days = attendance_records.filter(status='absent').count()
            leave_days = attendance_records.filter(status='leave').count()
            
            return Response({
                'type': 'staff',
                'employee': {
                    'id': employee.id,
                    'name': employee.name,
                    'employee_id': employee.employee_id
                },
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'summary': {
                    'total_days': total_days,
                    'present': present_days,
                    'absent': absent_days,
                    'leave': leave_days,
                    'attendance_percentage': round((present_days / total_days * 100) if total_days > 0 else 0, 2)
                }
            })
        
        # Student attendance report
        attendance_query = Attendance.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        )
        
        if student_id:
            attendance_query = attendance_query.filter(student_id=student_id)
            student = Student.objects.get(id=student_id)
            
            total_days = attendance_query.count()
            present_days = attendance_query.filter(status='present').count()
            absent_days = total_days - present_days
            
            return Response({
                'type': 'student',
                'student': {
                    'id': student.id,
                    'name': student.user.get_full_name()
                },
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'summary': {
                    'total_days': total_days,
                    'present': present_days,
                    'absent': absent_days,
                    'percentage': round((present_days / total_days * 100) if total_days > 0 else 0, 2)
                }
            })
        
        if class_id:
            attendance_query = attendance_query.filter(
                student__enrollment__classroom_id=class_id
            )
            classroom = ClassRoom.objects.get(id=class_id)
            total_students = Enrollment.objects.filter(
                classroom_id=class_id,
                is_active=True
            ).count()
        else:
            total_students = Student.objects.count()
        
        # Calculate class/school-wide statistics
        total_records = attendance_query.count()
        present_records = attendance_query.filter(status='present').count()
        
        # Daily attendance breakdown
        daily_attendance = []
        current_date = start_date
        while current_date <= end_date:
            day_records = attendance_query.filter(date=current_date)
            day_present = day_records.filter(status='present').count()
            day_total = day_records.count()
            
            daily_attendance.append({
                'date': current_date,
                'total_students': day_total,
                'present': day_present,
                'absent': day_total - day_present,
                'percentage': round((day_present / day_total * 100) if day_total > 0 else 0, 2)
            })
            current_date += timedelta(days=1)
        
        return Response({
            'type': 'class' if class_id else 'school',
            'class': {
                'id': classroom.id if class_id else None,
                'name': classroom.name if class_id else 'All Classes'
            } if class_id else None,
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_students': total_students,
                'total_records': total_records,
                'present_records': present_records,
                'absent_records': total_records - present_records,
                'overall_percentage': round((present_records / total_records * 100) if total_records > 0 else 0, 2)
            },
            'daily_breakdown': daily_attendance
        })
    
    @action(detail=False, methods=['get'])
    def fee_collection_report(self, request):
        """
        Fee collection report
        Query params: period (daily/monthly/yearly), start_date, end_date, class_id
        """
        period = request.query_params.get('period', 'monthly')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        class_id = request.query_params.get('class_id')
        
        today = timezone.now().date()
        
        # Set date range based on period
        if period == 'daily':
            start_date = today
            end_date = today
        elif period == 'monthly':
            start_date = today.replace(day=1) if not start_date else datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = today if not end_date else datetime.strptime(end_date, '%Y-%m-%d').date()
        else:  # yearly
            start_date = today.replace(month=1, day=1) if not start_date else datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = today if not end_date else datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Get payments in period
        payments = FeePayment.objects.filter(
            payment_date__gte=start_date,
            payment_date__lte=end_date,
            status='paid'
        )
        
        if class_id:
            payments = payments.filter(student__enrollment__classroom_id=class_id)
        
        # Calculate totals
        total_collected = payments.aggregate(total=Sum('amount_paid'))['total'] or Decimal('0')
        total_transactions = payments.count()
        
        # Payment method breakdown
        payment_methods = payments.values('payment_method').annotate(
            count=Count('id'),
            amount=Sum('amount_paid')
        )
        
        # Daily breakdown for the period
        daily_collection = []
        current_date = start_date
        while current_date <= end_date:
            day_payments = payments.filter(payment_date=current_date)
            day_total = day_payments.aggregate(total=Sum('amount_paid'))['total'] or Decimal('0')
            
            daily_collection.append({
                'date': current_date,
                'transactions': day_payments.count(),
                'amount': float(day_total)
            })
            current_date += timedelta(days=1)
        
        # Get pending fees
        all_fee_structures = FeeStructure.objects.all()
        if class_id:
            all_fee_structures = all_fee_structures.filter(
                class_room_id=class_id
            )
        
        total_expected = all_fee_structures.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0')
        
        pending_amount = float(total_expected) - float(total_collected)
        
        return Response({
            'period': {
                'type': period,
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_collected': float(total_collected),
                'total_transactions': total_transactions,
                'total_expected': float(total_expected),
                'pending_amount': pending_amount,
                'collection_rate': round((float(total_collected) / float(total_expected) * 100) if total_expected > 0 else 0, 2)
            },
            'payment_methods': [
                {
                    'method': pm['payment_method'],
                    'transactions': pm['count'],
                    'amount': float(pm['amount'])
                }
                for pm in payment_methods
            ],
            'daily_collection': daily_collection
        })
    
    @action(detail=False, methods=['get'])
    def teacher_performance(self, request):
        """
        Teacher performance report
        Query params: teacher_id (required)
        """
        teacher_id = request.query_params.get('teacher_id')
        
        if not teacher_id:
            return Response(
                {'error': 'teacher_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            teacher = Teacher.objects.select_related('user').get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response(
                {'error': 'Teacher not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get classes taught by teacher
        # Note: You may need to adjust this based on your actual model relationships
        classes_taught = ClassRoom.objects.filter(
            # Add appropriate filter based on your model
        ).count()
        
        # Get assignments created
        assignments_created = Assignment.objects.filter(
            teacher=teacher
        ).count()
        
        # Get assignment completion rate
        assignments = Assignment.objects.filter(teacher=teacher)
        total_expected_submissions = 0
        actual_submissions = 0
        
        for assignment in assignments:
            class_students = Enrollment.objects.filter(
                classroom=assignment.classroom,
                is_active=True
            ).count()
            total_expected_submissions += class_students
            actual_submissions += AssignmentSubmission.objects.filter(
                assignment=assignment
            ).count()
        
        completion_rate = (actual_submissions / total_expected_submissions * 100) if total_expected_submissions > 0 else 0
        
        # Get average grades of students taught
        # This would need proper model relationships
        
        return Response({
            'teacher': {
                'id': teacher.id,
                'name': teacher.user.get_full_name(),
                'email': teacher.user.email
            },
            'statistics': {
                'classes_taught': classes_taught,
                'assignments_created': assignments_created,
                'assignment_completion_rate': round(completion_rate, 2),
                'total_expected_submissions': total_expected_submissions,
                'actual_submissions': actual_submissions
            }
        })
