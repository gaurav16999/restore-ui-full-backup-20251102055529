"""
Phase 3 Views - Enhanced HR, Payroll, Leave, Expense, Asset, and Accounting Management
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import datetime, timedelta, date
from decimal import Decimal

from admin_api.models import (
    # Payroll
    SalaryGrade, AllowanceType, DeductionType, EmployeeSalaryStructure,
    EmployeeAllowance, EmployeeDeduction, Payslip, PayslipAllowance, PayslipDeduction,
    # Leave
    LeavePolicy, LeavePolicyRule, EmployeeLeaveBalance, LeaveApplication,
    # Expense
    ExpenseCategory, ExpenseClaim,
    # Asset
    AssetCategory, Asset, AssetAssignment, AssetMaintenance,
    # Accounting
    AccountGroup, JournalEntry, JournalEntryLine, BudgetAllocation,
    # Existing
    Employee, StaffAttendance, LeaveType
)

from admin_api.serializers.phase3 import (
    # Payroll
    SalaryGradeSerializer, AllowanceTypeSerializer, DeductionTypeSerializer,
    EmployeeSalaryStructureSerializer, EmployeeAllowanceSerializer, EmployeeDeductionSerializer,
    PayslipSerializer, PayslipCreateSerializer,
    # Leave
    LeavePolicySerializer, LeavePolicyRuleSerializer, EmployeeLeaveBalanceSerializer,
    LeaveBalanceInitSerializer, LeaveApplicationSerializer,
    # Expense
    ExpenseCategorySerializer, ExpenseClaimSerializer, ExpenseApprovalSerializer,
    # Asset
    AssetCategorySerializer, AssetSerializer, AssetAssignmentSerializer, AssetMaintenanceSerializer,
    # Accounting
    AccountGroupSerializer, JournalEntrySerializer, JournalEntryCreateSerializer,
    JournalEntryLineSerializer, BudgetAllocationSerializer
)


# ==================== PAYROLL VIEWSETS ====================

class SalaryGradeViewSet(viewsets.ModelViewSet):
    queryset = SalaryGrade.objects.all()
    serializer_class = SalaryGradeSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active salary grades"""
        grades = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(grades, many=True)
        return Response(serializer.data)


class AllowanceTypeViewSet(viewsets.ModelViewSet):
    queryset = AllowanceType.objects.all()
    serializer_class = AllowanceTypeSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active allowance types"""
        allowances = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(allowances, many=True)
        return Response(serializer.data)


class DeductionTypeViewSet(viewsets.ModelViewSet):
    queryset = DeductionType.objects.all()
    serializer_class = DeductionTypeSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active deduction types"""
        deductions = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(deductions, many=True)
        return Response(serializer.data)


class EmployeeSalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSalaryStructure.objects.select_related(
        'employee', 'salary_grade'
    ).prefetch_related('allowances', 'deductions')
    serializer_class = EmployeeSalaryStructureSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        is_active = self.request.query_params.get('is_active')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if is_active:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-effective_date')
    
    @action(detail=True, methods=['post'])
    def add_allowance(self, request, pk=None):
        """Add allowance to salary structure"""
        structure = self.get_object()
        serializer = EmployeeAllowanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(salary_structure=structure)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_deduction(self, request, pk=None):
        """Add deduction to salary structure"""
        structure = self.get_object()
        serializer = EmployeeDeductionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(salary_structure=structure)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get salary statistics"""
        structures = self.queryset.filter(is_active=True)
        
        stats = {
            'total_employees': structures.count(),
            'average_salary': structures.aggregate(avg=Sum('basic_salary'))['avg'] or 0,
            'total_payroll': sum(
                float(s.basic_salary) + 
                sum(float(a.amount) for a in s.allowances.filter(is_active=True))
                for s in structures
            )
        }
        return Response(stats)


class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.select_related(
        'employee', 'salary_structure', 'generated_by'
    ).prefetch_related('allowance_items', 'deduction_items')
    serializer_class = PayslipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        status_filter = self.request.query_params.get('status')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-year', '-month')
    
    @action(detail=False, methods=['post'])
    def generate_bulk(self, request):
        """Generate payslips for multiple employees"""
        serializer = PayslipCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        month = serializer.validated_data['month']
        year = serializer.validated_data['year']
        employee_ids = serializer.validated_data.get('employee_ids', [])
        payment_method = serializer.validated_data.get('payment_method', 'Bank Transfer')
        
        # Get employees
        if employee_ids:
            employees = Employee.objects.filter(id__in=employee_ids, is_active=True)
        else:
            employees = Employee.objects.filter(is_active=True)
        
        generated_payslips = []
        errors = []
        
        for employee in employees:
            try:
                # Check if payslip already exists
                if Payslip.objects.filter(employee=employee, month=month, year=year).exists():
                    errors.append(f"{employee.name}: Payslip already exists")
                    continue
                
                # Get salary structure
                structure = EmployeeSalaryStructure.objects.filter(
                    employee=employee,
                    is_active=True
                ).order_by('-effective_date').first()
                
                if not structure:
                    errors.append(f"{employee.name}: No active salary structure")
                    continue
                
                # Calculate attendance
                first_day = date(year, month, 1)
                if month == 12:
                    last_day = date(year + 1, 1, 1) - timedelta(days=1)
                else:
                    last_day = date(year, month + 1, 1) - timedelta(days=1)
                
                working_days = (last_day - first_day).days + 1
                attendance = StaffAttendance.objects.filter(
                    employee=employee,
                    date__gte=first_day,
                    date__lte=last_day
                )
                present_days = attendance.filter(status='present').count()
                leaves_taken = attendance.filter(status='on_leave').count()
                
                # Calculate salary components
                basic_salary = structure.basic_salary
                total_allowances = sum(
                    float(a.amount) for a in structure.allowances.filter(is_active=True)
                )
                total_deductions = sum(
                    float(d.amount) for d in structure.deductions.filter(is_active=True)
                )
                gross_salary = float(basic_salary) + total_allowances
                net_salary = gross_salary - total_deductions
                
                # Create payslip
                payslip = Payslip.objects.create(
                    employee=employee,
                    salary_structure=structure,
                    month=month,
                    year=year,
                    basic_salary=basic_salary,
                    total_allowances=Decimal(str(total_allowances)),
                    total_deductions=Decimal(str(total_deductions)),
                    gross_salary=Decimal(str(gross_salary)),
                    net_salary=Decimal(str(net_salary)),
                    working_days=working_days,
                    present_days=present_days,
                    leaves_taken=leaves_taken,
                    status='generated',
                    payment_method=payment_method,
                    generated_by=request.user
                )
                
                # Create allowance items
                for allowance in structure.allowances.filter(is_active=True):
                    PayslipAllowance.objects.create(
                        payslip=payslip,
                        allowance_type=allowance.allowance_type,
                        amount=allowance.amount
                    )
                
                # Create deduction items
                for deduction in structure.deductions.filter(is_active=True):
                    PayslipDeduction.objects.create(
                        payslip=payslip,
                        deduction_type=deduction.deduction_type,
                        amount=deduction.amount
                    )
                
                generated_payslips.append(payslip.id)
                
            except Exception as e:
                errors.append(f"{employee.name}: {str(e)}")
        
        return Response({
            'success': True,
            'generated_count': len(generated_payslips),
            'generated_payslips': generated_payslips,
            'errors': errors
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark payslip as paid"""
        payslip = self.get_object()
        payment_date = request.data.get('payment_date', date.today())
        
        payslip.status = 'paid'
        payslip.payment_date = payment_date
        payslip.save()
        
        serializer = self.get_serializer(payslip)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get payroll statistics"""
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        
        payslips = self.queryset.filter(month=month, year=year)
        
        stats = {
            'total_payslips': payslips.count(),
            'total_gross': payslips.aggregate(total=Sum('gross_salary'))['total'] or 0,
            'total_net': payslips.aggregate(total=Sum('net_salary'))['total'] or 0,
            'total_allowances': payslips.aggregate(total=Sum('total_allowances'))['total'] or 0,
            'total_deductions': payslips.aggregate(total=Sum('total_deductions'))['total'] or 0,
            'status_breakdown': {
                'draft': payslips.filter(status='draft').count(),
                'generated': payslips.filter(status='generated').count(),
                'sent': payslips.filter(status='sent').count(),
                'paid': payslips.filter(status='paid').count(),
            }
        }
        return Response(stats)


# ==================== LEAVE MANAGEMENT VIEWSETS ====================

class LeavePolicyViewSet(viewsets.ModelViewSet):
    queryset = LeavePolicy.objects.prefetch_related('rules')
    serializer_class = LeavePolicySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active leave policies"""
        policies = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(policies, many=True)
        return Response(serializer.data)


class EmployeeLeaveBalanceViewSet(viewsets.ModelViewSet):
    queryset = EmployeeLeaveBalance.objects.select_related('employee', 'leave_type')
    serializer_class = EmployeeLeaveBalanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        year = self.request.query_params.get('year')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if year:
            queryset = queryset.filter(year=year)
        
        return queryset.order_by('-year', 'leave_type__name')
    
    @action(detail=False, methods=['post'])
    def initialize_balances(self, request):
        """Initialize leave balances for employees"""
        serializer = LeaveBalanceInitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        year = serializer.validated_data['year']
        employee_ids = serializer.validated_data.get('employee_ids', [])
        
        if employee_ids:
            employees = Employee.objects.filter(id__in=employee_ids, is_active=True)
        else:
            employees = Employee.objects.filter(is_active=True)
        
        created_count = 0
        errors = []
        
        for employee in employees:
            try:
                # Get applicable leave policy
                policy = LeavePolicy.objects.filter(
                    Q(designation=employee.designation) | Q(department=employee.department) | Q(is_default=True),
                    is_active=True
                ).first()
                
                if not policy:
                    errors.append(f"{employee.name}: No applicable leave policy")
                    continue
                
                # Create balances for each leave type in policy
                for rule in policy.rules.all():
                    balance, created = EmployeeLeaveBalance.objects.get_or_create(
                        employee=employee,
                        leave_type=rule.leave_type,
                        year=year,
                        defaults={
                            'total_allocated': Decimal(str(rule.annual_quota)),
                            'used': Decimal('0'),
                            'carried_forward': Decimal('0')
                        }
                    )
                    if created:
                        created_count += 1
                
            except Exception as e:
                errors.append(f"{employee.name}: {str(e)}")
        
        return Response({
            'success': True,
            'created_count': created_count,
            'errors': errors
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get leave balance summary"""
        employee_id = request.query_params.get('employee_id')
        year = int(request.query_params.get('year', timezone.now().year))
        
        if not employee_id:
            return Response(
                {'error': 'employee_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        balances = self.queryset.filter(employee_id=employee_id, year=year)
        serializer = self.get_serializer(balances, many=True)
        
        return Response({
            'year': year,
            'employee_id': employee_id,
            'balances': serializer.data,
            'total_allocated': sum(float(b.total_allocated) for b in balances),
            'total_used': sum(float(b.used) for b in balances),
            'total_available': sum(b.available() for b in balances)
        })


class LeaveApplicationViewSet(viewsets.ModelViewSet):
    """Phase 3 Leave Application ViewSet with approve/reject actions"""
    queryset = LeaveApplication.objects.select_related(
        'applicant', 'leave_type', 'approved_by'
    ).all()
    serializer_class = LeaveApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        employee_id = self.request.query_params.get('employee')
        
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        if employee_id:
            queryset = queryset.filter(applicant_id=employee_id)
        
        return queryset.order_by('-applied_at')
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave application"""
        application = self.get_object()
        
        if application.status != 'pending':
            return Response(
                {'error': 'Only pending applications can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update application status
        application.status = 'approved'
        application.approved_by = request.user
        application.approved_at = timezone.now()
        application.save()
        
        # Update leave balance
        try:
            leave_balance = EmployeeLeaveBalance.objects.get(
                employee=application.applicant,
                leave_type=application.leave_type,
                year=application.from_date.year
            )
            
            # Calculate days
            days = (application.to_date - application.from_date).days + 1
            leave_balance.used += Decimal(str(days))
            leave_balance.save()
            
        except EmployeeLeaveBalance.DoesNotExist:
            pass  # Balance not found, may need to create it
        
        return Response({
            'success': True,
            'message': 'Leave application approved successfully'
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave application"""
        application = self.get_object()
        
        if application.status != 'pending':
            return Response(
                {'error': 'Only pending applications can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application.status = 'rejected'
        application.approved_by = request.user
        application.approved_at = timezone.now()
        application.save()
        
        return Response({
            'success': True,
            'message': 'Leave application rejected successfully'
        })


# ==================== EXPENSE MANAGEMENT VIEWSETS ====================

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active expense categories"""
        categories = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class ExpenseClaimViewSet(viewsets.ModelViewSet):
    queryset = ExpenseClaim.objects.select_related('employee', 'category', 'approved_by')
    serializer_class = ExpenseClaimSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id')
        status_filter = self.request.query_params.get('status')
        category_id = self.request.query_params.get('category_id')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit expense claim for approval"""
        claim = self.get_object()
        
        if claim.status != 'draft':
            return Response(
                {'error': 'Only draft claims can be submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        claim.status = 'submitted'
        claim.submitted_at = timezone.now()
        claim.save()
        
        serializer = self.get_serializer(claim)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Approve or reject expense claim"""
        claim = self.get_object()
        serializer = ExpenseApprovalSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if claim.status != 'submitted':
            return Response(
                {'error': 'Only submitted claims can be processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_type = serializer.validated_data['action']
        notes = serializer.validated_data.get('notes', '')
        
        if action_type == 'approve':
            claim.status = 'approved'
            payment_date = serializer.validated_data.get('payment_date')
            if payment_date:
                claim.payment_date = payment_date
                claim.status = 'paid'
        else:
            claim.status = 'rejected'
        
        claim.approved_by = request.user
        claim.approved_at = timezone.now()
        claim.approval_notes = notes
        claim.save()
        
        return Response(self.get_serializer(claim).data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get expense statistics"""
        year = int(request.query_params.get('year', timezone.now().year))
        month = request.query_params.get('month')
        
        claims = self.queryset.filter(expense_date__year=year)
        if month:
            claims = claims.filter(expense_date__month=month)
        
        stats = {
            'total_claims': claims.count(),
            'total_amount': claims.aggregate(total=Sum('amount'))['total'] or 0,
            'approved_amount': claims.filter(status__in=['approved', 'paid']).aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'pending_count': claims.filter(status='submitted').count(),
            'status_breakdown': {
                'draft': claims.filter(status='draft').count(),
                'submitted': claims.filter(status='submitted').count(),
                'approved': claims.filter(status='approved').count(),
                'rejected': claims.filter(status='rejected').count(),
                'paid': claims.filter(status='paid').count(),
            },
            'category_breakdown': list(
                claims.values('category__name').annotate(
                    total=Sum('amount'),
                    count=Count('id')
                )
            )
        }
        return Response(stats)


# ==================== ASSET MANAGEMENT VIEWSETS ====================

class AssetCategoryViewSet(viewsets.ModelViewSet):
    queryset = AssetCategory.objects.all()
    serializer_class = AssetCategorySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active asset categories"""
        categories = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.select_related('category')
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category_id')
        status_filter = self.request.query_params.get('status')
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign asset to employee"""
        asset = self.get_object()
        
        if asset.status != 'available':
            return Response(
                {'error': 'Asset is not available for assignment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AssetAssignmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        assignment = serializer.save(
            asset=asset,
            assigned_by=request.user,
            is_active=True
        )
        
        asset.status = 'assigned'
        asset.save()
        
        return Response(AssetAssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def return_asset(self, request, pk=None):
        """Return asset from employee"""
        asset = self.get_object()
        
        assignment = asset.assignments.filter(is_active=True).first()
        if not assignment:
            return Response(
                {'error': 'No active assignment found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment.returned_date = date.today()
        assignment.condition_at_return = request.data.get('condition', asset.condition)
        assignment.notes = request.data.get('notes', '')
        assignment.is_active = False
        assignment.save()
        
        asset.status = 'available'
        asset.condition = assignment.condition_at_return
        asset.save()
        
        return Response(AssetAssignmentSerializer(assignment).data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get asset statistics"""
        assets = self.queryset.all()
        
        stats = {
            'total_assets': assets.count(),
            'total_value': assets.aggregate(total=Sum('current_value'))['total'] or 0,
            'status_breakdown': {
                'available': assets.filter(status='available').count(),
                'assigned': assets.filter(status='assigned').count(),
                'maintenance': assets.filter(status='maintenance').count(),
                'retired': assets.filter(status='retired').count(),
                'damaged': assets.filter(status='damaged').count(),
                'lost': assets.filter(status='lost').count(),
            },
            'condition_breakdown': {
                'excellent': assets.filter(condition='excellent').count(),
                'good': assets.filter(condition='good').count(),
                'fair': assets.filter(condition='fair').count(),
                'poor': assets.filter(condition='poor').count(),
            },
            'category_breakdown': list(
                assets.values('category__name').annotate(
                    count=Count('id'),
                    total_value=Sum('current_value')
                )
            )
        }
        return Response(stats)


class AssetAssignmentViewSet(viewsets.ModelViewSet):
    """Asset Assignment Management"""
    queryset = AssetAssignment.objects.select_related(
        'asset', 'assigned_to', 'assigned_by', 'returned_by'
    ).all()
    serializer_class = AssetAssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        employee_id = self.request.query_params.get('employee_id')
        asset_id = self.request.query_params.get('asset_id')
        
        if is_active == 'true':
            queryset = queryset.filter(returned_at__isnull=True)
        elif is_active == 'false':
            queryset = queryset.filter(returned_at__isnull=False)
        
        if employee_id:
            queryset = queryset.filter(assigned_to_id=employee_id)
        if asset_id:
            queryset = queryset.filter(asset_id=asset_id)
        
        return queryset.order_by('-assigned_at')
    
    @action(detail=True, methods=['post'])
    def return_asset(self, request, pk=None):
        """Mark asset as returned"""
        assignment = self.get_object()
        
        if assignment.returned_at:
            return Response(
                {'error': 'Asset already returned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment.returned_at = timezone.now()
        assignment.returned_by = request.user
        assignment.return_condition = request.data.get('return_condition', assignment.asset.condition)
        assignment.return_notes = request.data.get('return_notes', '')
        assignment.save()
        
        # Update asset status back to available
        assignment.asset.status = 'available'
        assignment.asset.condition = assignment.return_condition
        assignment.asset.save()
        
        return Response({
            'success': True,
            'message': 'Asset returned successfully'
        })


class AssetMaintenanceViewSet(viewsets.ModelViewSet):
    queryset = AssetMaintenance.objects.select_related('asset')
    serializer_class = AssetMaintenanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        asset_id = self.request.query_params.get('asset_id')
        status_filter = self.request.query_params.get('status')
        
        if asset_id:
            queryset = queryset.filter(asset_id=asset_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-scheduled_date')
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark maintenance as completed"""
        maintenance = self.get_object()
        
        maintenance.status = 'completed'
        maintenance.completed_date = date.today()
        maintenance.notes = request.data.get('notes', maintenance.notes)
        maintenance.cost = request.data.get('cost', maintenance.cost)
        maintenance.save()
        
        # Update asset status back to available
        if maintenance.asset.status == 'maintenance':
            maintenance.asset.status = 'available'
            maintenance.asset.save()
        
        serializer = self.get_serializer(maintenance)
        return Response(serializer.data)


# ==================== ACCOUNTING VIEWSETS ====================

class AccountGroupViewSet(viewsets.ModelViewSet):
    queryset = AccountGroup.objects.all()
    serializer_class = AccountGroupSerializer
    permission_classes = [IsAuthenticated]


class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.prefetch_related('lines')
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if from_date:
            queryset = queryset.filter(entry_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(entry_date__lte=to_date)
        
        return queryset.order_by('-entry_date')
    
    @action(detail=False, methods=['post'])
    def create_entry(self, request):
        """Create journal entry with lines"""
        serializer = JournalEntryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Calculate totals
        total_debit = sum(Decimal(str(line.get('debit', 0))) for line in data['lines'])
        total_credit = sum(Decimal(str(line.get('credit', 0))) for line in data['lines'])
        
        # Create journal entry
        entry = JournalEntry.objects.create(
            entry_date=data['entry_date'],
            description=data['description'],
            reference=data.get('reference', ''),
            total_debit=total_debit,
            total_credit=total_credit,
            created_by=request.user,
            status='draft'
        )
        
        # Create lines
        for line_data in data['lines']:
            JournalEntryLine.objects.create(
                journal_entry=entry,
                account_id=line_data['account_id'],
                description=line_data.get('description', ''),
                debit=Decimal(str(line_data.get('debit', 0))),
                credit=Decimal(str(line_data.get('credit', 0)))
            )
        
        return Response(
            JournalEntrySerializer(entry).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def post(self, request, pk=None):
        """Post journal entry (make it permanent)"""
        entry = self.get_object()
        
        if entry.status != 'draft':
            return Response(
                {'error': 'Only draft entries can be posted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not entry.is_balanced():
            return Response(
                {'error': 'Entry is not balanced'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        entry.status = 'posted'
        entry.posted_at = timezone.now()
        entry.save()
        
        serializer = self.get_serializer(entry)
        return Response(serializer.data)


class BudgetAllocationViewSet(viewsets.ModelViewSet):
    queryset = BudgetAllocation.objects.select_related('department', 'account')
    serializer_class = BudgetAllocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get('department_id')
        fiscal_year = self.request.query_params.get('fiscal_year')
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if fiscal_year:
            queryset = queryset.filter(fiscal_year=fiscal_year)
        
        return queryset.order_by('-fiscal_year', 'department__name')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get budget summary"""
        fiscal_year = int(request.query_params.get('fiscal_year', timezone.now().year))
        
        budgets = self.queryset.filter(fiscal_year=fiscal_year, is_active=True)
        
        stats = {
            'fiscal_year': fiscal_year,
            'total_allocated': budgets.aggregate(total=Sum('allocated_amount'))['total'] or 0,
            'total_spent': budgets.aggregate(total=Sum('spent_amount'))['total'] or 0,
            'department_breakdown': list(
                budgets.values('department__name').annotate(
                    allocated=Sum('allocated_amount'),
                    spent=Sum('spent_amount')
                )
            ),
            'over_budget_count': sum(
                1 for b in budgets if b.budget_utilization_percentage() > 100
            ),
            'critical_budgets': [
                {
                    'department': b.department.name,
                    'account': b.account.name,
                    'utilization': round(b.budget_utilization_percentage(), 2)
                }
                for b in budgets if b.budget_utilization_percentage() > 80
            ]
        }
        return Response(stats)
