"""
Advanced HR Module ViewSets
Handles Payroll, Leave Management, Employee Details, Holidays
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Sum, Count, Avg
from datetime import datetime, timedelta
from decimal import Decimal
import openpyxl
from io import BytesIO
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch

from admin_api.models import Teacher, Designation, LeaveApplication, Payslip
from admin_api.models_hr import (
    EmployeeDetails, PayrollComponent, PayrollRun, PayslipComponent, Holiday
)
from users.models import User


class DesignationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employee designations/positions
    """
    queryset = Designation.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.hr import DesignationSerializer
        return DesignationSerializer
    
    def get_queryset(self):
        queryset = Designation.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('level', 'name')
    
    @action(detail=False, methods=['get'])
    def hierarchy(self, request):
        """Get designation hierarchy by level"""
        from admin_api.serializers.hr import DesignationSerializer
        
        designations = Designation.objects.filter(is_active=True).order_by('level', 'name')
        
        # Group by level
        hierarchy = {}
        for designation in designations:
            level = f"Level {designation.level}"
            if level not in hierarchy:
                hierarchy[level] = []
            hierarchy[level].append(DesignationSerializer(designation).data)
        
        return Response(hierarchy)


class EmployeeDetailsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing extended employee information
    """
    queryset = EmployeeDetails.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.hr import EmployeeSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        queryset = EmployeeDetails.objects.select_related(
            'teacher__user', 'designation'
        ).all()
        
        # Filter by employment type
        employment_type = self.request.query_params.get('employment_type')
        if employment_type:
            queryset = queryset.filter(employment_type=employment_type)
        
        # Filter by designation
        designation_id = self.request.query_params.get('designation')
        if designation_id:
            queryset = queryset.filter(designation_id=designation_id)
        
        # Search by employee name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(teacher__user__first_name__icontains=search) |
                Q(teacher__user__last_name__icontains=search) |
                Q(teacher__employee_id__icontains=search)
            )
        
        return queryset.order_by('teacher__user__first_name')
    
    @action(detail=True, methods=['get'])
    def employment_history(self, request, pk=None):
        """Get employee's employment history"""
        employee = self.get_object()
        
        return Response({
            'employee_id': employee.teacher.employee_id,
            'name': employee.teacher.user.get_full_name(),
            'designation': employee.designation.name if employee.designation else None,
            'date_of_joining': employee.date_of_joining,
            'date_of_leaving': employee.date_of_leaving,
            'employment_type': employee.employment_type,
            'employment_duration_days': (
                (employee.date_of_leaving or timezone.now().date()) - employee.date_of_joining
            ).days if employee.date_of_joining else 0,
            'bank_account': employee.bank_account_number,
            'tax_id': employee.tax_id_number
        })


class PayrollComponentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing payroll components (earnings and deductions)
    """
    queryset = PayrollComponent.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.hr import PayrollRecordSerializer
        return PayrollRecordSerializer
    
    def get_queryset(self):
        queryset = PayrollComponent.objects.all()
        
        # Filter by type
        component_type = self.request.query_params.get('type')
        if component_type:
            queryset = queryset.filter(type=component_type)
        
        # Filter by calculation method
        calculation_method = self.request.query_params.get('calculation_method')
        if calculation_method:
            queryset = queryset.filter(calculation_method=calculation_method)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('type', 'name')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of active components"""
        earnings = PayrollComponent.objects.filter(
            type='earning', is_active=True
        ).count()
        deductions = PayrollComponent.objects.filter(
            type='deduction', is_active=True
        ).count()
        
        return Response({
            'total_earnings_components': earnings,
            'total_deductions_components': deductions,
            'total_components': earnings + deductions
        })


class PayrollRunViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing monthly payroll processing
    """
    queryset = PayrollRun.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.hr import PayrollRecordSerializer
        return PayrollRecordSerializer
    
    def get_queryset(self):
        queryset = PayrollRun.objects.all()
        
        # Filter by status
        payroll_status = self.request.query_params.get('status')
        if payroll_status:
            queryset = queryset.filter(status=payroll_status)
        
        # Filter by month/year
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            queryset = queryset.filter(month=int(month))
        if year:
            queryset = queryset.filter(year=int(year))
        
        return queryset.order_by('-year', '-month')
    
    @action(detail=False, methods=['post'])
    def process_payroll(self, request):
        """
        Process payroll for a specific month
        Creates payslips for all active employees
        """
        month = request.data.get('month')
        year = request.data.get('year')
        
        if not month or not year:
            return Response(
                {'error': 'month and year are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if payroll already exists
        existing_run = PayrollRun.objects.filter(month=month, year=year).first()
        if existing_run and existing_run.status != 'draft':
            return Response(
                {'error': 'Payroll for this month already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or get payroll run
        payroll_run, created = PayrollRun.objects.get_or_create(
            month=month,
            year=year,
            defaults={
                'status': 'draft',
                'processed_by': request.user
            }
        )
        
        # Get all active employees
        employees = EmployeeDetails.objects.filter(
            date_of_leaving__isnull=True
        ).select_related('teacher__user', 'designation')
        
        total_amount = Decimal('0.00')
        payslips_created = 0
        
        for employee in employees:
            # Calculate salary (basic salary from teacher model or employee details)
            basic_salary = getattr(employee.teacher, 'salary', Decimal('0.00'))
            
            # Get active payroll components
            earnings = PayrollComponent.objects.filter(
                type='earning', is_active=True
            )
            deductions = PayrollComponent.objects.filter(
                type='deduction', is_active=True
            )
            
            # Calculate total earnings and deductions
            total_earnings = basic_salary
            total_deductions = Decimal('0.00')
            
            for earning in earnings:
                if earning.calculation_method == 'fixed':
                    total_earnings += earning.amount
                else:  # percentage
                    total_earnings += (basic_salary * earning.amount / 100)
            
            for deduction in deductions:
                if deduction.calculation_method == 'fixed':
                    total_deductions += deduction.amount
                else:  # percentage
                    total_deductions += (basic_salary * deduction.amount / 100)
            
            net_salary = total_earnings - total_deductions
            
            # Create or update payslip
            payslip, created = Payslip.objects.update_or_create(
                payroll_run=payroll_run,
                employee=employee,
                defaults={
                    'basic_salary': basic_salary,
                    'total_earnings': total_earnings,
                    'total_deductions': total_deductions,
                    'net_salary': net_salary,
                    'payment_date': None,
                    'payment_method': 'bank_transfer',
                    'status': 'pending'
                }
            )
            
            if created:
                payslips_created += 1
                
                # Create payslip components
                for earning in earnings:
                    amount = (
                        earning.amount if earning.calculation_method == 'fixed'
                        else (basic_salary * earning.amount / 100)
                    )
                    PayslipComponent.objects.create(
                        payslip=payslip,
                        component=earning,
                        amount=amount
                    )
                
                for deduction in deductions:
                    amount = (
                        deduction.amount if deduction.calculation_method == 'fixed'
                        else (basic_salary * deduction.amount / 100)
                    )
                    PayslipComponent.objects.create(
                        payslip=payslip,
                        component=deduction,
                        amount=amount
                    )
            
            total_amount += net_salary
        
        # Update payroll run
        payroll_run.total_employees = employees.count()
        payroll_run.total_amount = total_amount
        payroll_run.status = 'processed'
        payroll_run.processed_at = timezone.now()
        payroll_run.save()
        
        return Response({
            'message': f'Payroll processed successfully for {month}/{year}',
            'payroll_run_id': payroll_run.id,
            'total_employees': employees.count(),
            'payslips_created': payslips_created,
            'total_amount': float(total_amount)
        })
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark payroll run as paid"""
        payroll_run = self.get_object()
        
        if payroll_run.status == 'paid':
            return Response(
                {'error': 'Payroll already marked as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update all payslips to paid
        Payslip.objects.filter(payroll_run=payroll_run).update(
            status='paid',
            payment_date=timezone.now().date()
        )
        
        payroll_run.status = 'paid'
        payroll_run.save()
        
        return Response({'message': 'Payroll marked as paid'})
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get payroll run summary"""
        payroll_run = self.get_object()
        
        payslips = Payslip.objects.filter(payroll_run=payroll_run)
        
        return Response({
            'month': payroll_run.month,
            'year': payroll_run.year,
            'status': payroll_run.status,
            'total_employees': payroll_run.total_employees,
            'total_amount': float(payroll_run.total_amount),
            'paid_count': payslips.filter(status='paid').count(),
            'pending_count': payslips.filter(status='pending').count(),
            'processed_at': payroll_run.processed_at,
            'processed_by': payroll_run.processed_by.get_full_name() if payroll_run.processed_by else None
        })


class PayslipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing individual employee payslips
    """
    queryset = Payslip.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.hr import PayrollRecordSerializer
        return PayrollRecordSerializer
    
    def get_queryset(self):
        queryset = Payslip.objects.select_related(
            'payroll_run', 'employee__teacher__user'
        ).all()
        
        # Filter by payroll run
        payroll_run_id = self.request.query_params.get('payroll_run')
        if payroll_run_id:
            queryset = queryset.filter(payroll_run_id=payroll_run_id)
        
        # Filter by employee
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        # Filter by status
        payslip_status = self.request.query_params.get('status')
        if payslip_status:
            queryset = queryset.filter(status=payslip_status)
        
        # Filter by month/year
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            queryset = queryset.filter(payroll_run__month=int(month))
        if year:
            queryset = queryset.filter(payroll_run__year=int(year))
        
        return queryset.order_by('-payroll_run__year', '-payroll_run__month')
    
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Generate and download payslip as PDF"""
        payslip = self.get_object()
        
        # Create PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        # Header
        p.setFont("Helvetica-Bold", 16)
        p.drawString(1*inch, height - 1*inch, "PAYSLIP")
        
        p.setFont("Helvetica", 10)
        p.drawString(1*inch, height - 1.3*inch, f"Month: {payslip.payroll_run.month}/{payslip.payroll_run.year}")
        
        # Employee details
        y = height - 2*inch
        p.setFont("Helvetica-Bold", 12)
        p.drawString(1*inch, y, "Employee Details")
        
        y -= 0.3*inch
        p.setFont("Helvetica", 10)
        p.drawString(1*inch, y, f"Name: {payslip.employee.teacher.user.get_full_name()}")
        y -= 0.2*inch
        p.drawString(1*inch, y, f"Employee ID: {payslip.employee.teacher.employee_id}")
        y -= 0.2*inch
        p.drawString(1*inch, y, f"Designation: {payslip.employee.designation.name if payslip.employee.designation else 'N/A'}")
        
        # Salary details
        y -= 0.5*inch
        p.setFont("Helvetica-Bold", 12)
        p.drawString(1*inch, y, "Salary Details")
        
        y -= 0.3*inch
        p.setFont("Helvetica", 10)
        p.drawString(1*inch, y, "Description")
        p.drawString(4*inch, y, "Amount")
        
        y -= 0.2*inch
        p.line(1*inch, y, 6*inch, y)
        
        # Basic salary
        y -= 0.2*inch
        p.drawString(1*inch, y, "Basic Salary")
        p.drawString(4*inch, y, f"${payslip.basic_salary:.2f}")
        
        # Earnings
        components = PayslipComponent.objects.filter(
            payslip=payslip, component__type='earning'
        ).select_related('component')
        
        for comp in components:
            y -= 0.2*inch
            p.drawString(1*inch, y, comp.component.name)
            p.drawString(4*inch, y, f"${comp.amount:.2f}")
        
        # Total earnings
        y -= 0.2*inch
        p.line(1*inch, y, 6*inch, y)
        y -= 0.2*inch
        p.setFont("Helvetica-Bold", 10)
        p.drawString(1*inch, y, "Total Earnings")
        p.drawString(4*inch, y, f"${payslip.total_earnings:.2f}")
        
        # Deductions
        y -= 0.3*inch
        p.setFont("Helvetica", 10)
        deduction_components = PayslipComponent.objects.filter(
            payslip=payslip, component__type='deduction'
        ).select_related('component')
        
        for comp in deduction_components:
            y -= 0.2*inch
            p.drawString(1*inch, y, comp.component.name)
            p.drawString(4*inch, y, f"-${comp.amount:.2f}")
        
        # Total deductions
        y -= 0.2*inch
        p.line(1*inch, y, 6*inch, y)
        y -= 0.2*inch
        p.setFont("Helvetica-Bold", 10)
        p.drawString(1*inch, y, "Total Deductions")
        p.drawString(4*inch, y, f"-${payslip.total_deductions:.2f}")
        
        # Net salary
        y -= 0.3*inch
        p.line(1*inch, y, 6*inch, y)
        y -= 0.2*inch
        p.setFont("Helvetica-Bold", 12)
        p.drawString(1*inch, y, "Net Salary")
        p.drawString(4*inch, y, f"${payslip.net_salary:.2f}")
        
        # Footer
        y -= 0.5*inch
        p.setFont("Helvetica", 8)
        p.drawString(1*inch, y, f"Payment Method: {payslip.get_payment_method_display()}")
        if payslip.payment_date:
            y -= 0.2*inch
            p.drawString(1*inch, y, f"Payment Date: {payslip.payment_date}")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=payslip_{payslip.employee.teacher.employee_id}_{payslip.payroll_run.month}_{payslip.payroll_run.year}.pdf'
        
        return response
    
    @action(detail=False, methods=['get'])
    def my_payslips(self, request):
        """Get payslips for logged-in employee"""
        from admin_api.serializers.hr import PayrollRecordSerializer
        
        if request.user.role != 'teacher':
            return Response(
                {'error': 'Only teachers/staff can access their payslips'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            employee = EmployeeDetails.objects.get(teacher=request.user.teacher)
            payslips = Payslip.objects.filter(employee=employee).order_by(
                '-payroll_run__year', '-payroll_run__month'
            )
            
            serializer = PayrollRecordSerializer(payslips, many=True)
            return Response(serializer.data)
        except EmployeeDetails.DoesNotExist:
            return Response(
                {'error': 'Employee details not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class LeaveApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employee leave applications
    """
    queryset = LeaveApplication.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.leave import LeaveApplicationSerializer
        return LeaveApplicationSerializer
    
    def get_queryset(self):
        queryset = LeaveApplication.objects.select_related(
            'employee__teacher__user', 'leave_type', 'approved_by'
        ).all()
        
        # Filter by employee
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        elif self.request.user.role == 'teacher':
            # Teachers see only their own leaves
            try:
                employee = EmployeeDetails.objects.get(teacher=self.request.user.teacher)
                queryset = queryset.filter(employee=employee)
            except EmployeeDetails.DoesNotExist:
                queryset = queryset.none()
        
        # Filter by status
        leave_status = self.request.query_params.get('status')
        if leave_status:
            queryset = queryset.filter(status=leave_status)
        
        # Filter by leave type
        leave_type_id = self.request.query_params.get('leave_type')
        if leave_type_id:
            queryset = queryset.filter(leave_type_id=leave_type_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        return queryset.order_by('-applied_date')
    
    def perform_create(self, serializer):
        # Calculate total days
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        total_days = (end_date - start_date).days + 1
        
        serializer.save(total_days=total_days)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve leave application"""
        leave = self.get_object()
        
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending leaves can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave.status = 'approved'
        leave.approved_by = request.user
        leave.approved_date = timezone.now().date()
        leave.admin_remarks = request.data.get('admin_remarks', '')
        leave.save()
        
        # TODO: Send notification to employee
        
        from admin_api.serializers.leave import LeaveApplicationSerializer
        serializer = LeaveApplicationSerializer(leave)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject leave application"""
        leave = self.get_object()
        
        if leave.status != 'pending':
            return Response(
                {'error': 'Only pending leaves can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        admin_remarks = request.data.get('admin_remarks')
        if not admin_remarks:
            return Response(
                {'error': 'admin_remarks is required for rejection'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave.status = 'rejected'
        leave.approved_by = request.user
        leave.approved_date = timezone.now().date()
        leave.admin_remarks = admin_remarks
        leave.save()
        
        # TODO: Send notification to employee
        
        from admin_api.serializers.leave import LeaveApplicationSerializer
        serializer = LeaveApplicationSerializer(leave)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Approve multiple leave applications"""
        leave_ids = request.data.get('leave_ids', [])
        
        if not leave_ids:
            return Response(
                {'error': 'leave_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leaves = LeaveApplication.objects.filter(
            id__in=leave_ids,
            status='pending'
        )
        
        approved_count = leaves.update(
            status='approved',
            approved_by=request.user,
            approved_date=timezone.now().date()
        )
        
        return Response({
            'message': f'Approved {approved_count} leave applications',
            'approved_count': approved_count
        })
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get all pending leave applications"""
        from admin_api.serializers.leave import LeaveApplicationSerializer
        
        leaves = LeaveApplication.objects.filter(
            status='pending'
        ).select_related('employee__teacher__user', 'leave_type').order_by('applied_date')
        
        serializer = LeaveApplicationSerializer(leaves, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def leave_balance(self, request):
        """Get leave balance for employee"""
        employee_id = request.query_params.get('employee_id')
        year = request.query_params.get('year', timezone.now().year)
        
        if not employee_id:
            if request.user.role == 'teacher':
                try:
                    employee = EmployeeDetails.objects.get(teacher=request.user.teacher)
                    employee_id = employee.id
                except EmployeeDetails.DoesNotExist:
                    return Response(
                        {'error': 'Employee details not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                return Response(
                    {'error': 'employee_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Get approved leaves for the year
        from admin_api.models import LeaveType
        leave_types = LeaveType.objects.filter(is_active=True)
        
        balance = []
        for leave_type in leave_types:
            used = LeaveApplication.objects.filter(
                employee_id=employee_id,
                leave_type=leave_type,
                status='approved',
                start_date__year=year
            ).aggregate(total=Sum('total_days'))['total'] or 0
            
            balance.append({
                'leave_type': leave_type.name,
                'total_days': leave_type.days_per_year,
                'used_days': used,
                'remaining_days': leave_type.days_per_year - used
            })
        
        return Response({
            'year': year,
            'employee_id': employee_id,
            'leave_balance': balance
        })


class HolidayViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing holiday calendar
    """
    queryset = Holiday.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from admin_api.serializers.hr import DesignationSerializer
        return DesignationSerializer
    
    def get_queryset(self):
        queryset = Holiday.objects.all()
        
        # Filter by year
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(date__year=int(year))
        
        # Filter by optional holidays
        is_optional = self.request.query_params.get('is_optional')
        if is_optional is not None:
            queryset = queryset.filter(is_optional=is_optional.lower() == 'true')
        
        return queryset.order_by('date')
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming holidays"""
        from admin_api.serializers.hr import DesignationSerializer
        
        holidays = Holiday.objects.filter(
            date__gte=timezone.now().date()
        ).order_by('date')[:10]
        
        serializer = DesignationSerializer(holidays, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def yearly_calendar(self, request):
        """Get holiday calendar for a year"""
        from admin_api.serializers.hr import DesignationSerializer
        
        year = request.query_params.get('year', timezone.now().year)
        holidays = Holiday.objects.filter(date__year=year).order_by('date')
        
        # Group by month
        calendar = {}
        for holiday in holidays:
            month = holiday.date.strftime('%B')
            if month not in calendar:
                calendar[month] = []
            
            calendar[month].append(DesignationSerializer(holiday).data)
        
        return Response({
            'year': year,
            'total_holidays': holidays.count(),
            'calendar': calendar
        })
