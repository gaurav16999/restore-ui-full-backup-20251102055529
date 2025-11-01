"""
Phase 3 Serializers - Enhanced HR, Payroll, Leave, Expense, Asset, and Accounting Management
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
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
    # Existing models
    Employee, Department, Designation, LeaveType, ChartOfAccount
)

User = get_user_model()


# ==================== PAYROLL SERIALIZERS ====================

class SalaryGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryGrade
        fields = '__all__'


class AllowanceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllowanceType
        fields = '__all__'


class DeductionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeductionType
        fields = '__all__'


class EmployeeAllowanceSerializer(serializers.ModelSerializer):
    allowance_type_details = AllowanceTypeSerializer(source='allowance_type', read_only=True)
    allowance_name = serializers.CharField(source='allowance_type.name', read_only=True)
    
    class Meta:
        model = EmployeeAllowance
        fields = '__all__'


class EmployeeDeductionSerializer(serializers.ModelSerializer):
    deduction_type_details = DeductionTypeSerializer(source='deduction_type', read_only=True)
    deduction_name = serializers.CharField(source='deduction_type.name', read_only=True)
    
    class Meta:
        model = EmployeeDeduction
        fields = '__all__'


class EmployeeSalaryStructureSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id_number = serializers.CharField(source='employee.employee_id', read_only=True)
    designation = serializers.CharField(source='employee.designation.name', read_only=True)
    department = serializers.CharField(source='employee.department.name', read_only=True)
    salary_grade_details = SalaryGradeSerializer(source='salary_grade', read_only=True)
    allowances = EmployeeAllowanceSerializer(many=True, read_only=True)
    deductions = EmployeeDeductionSerializer(many=True, read_only=True)
    total_allowances = serializers.SerializerMethodField()
    total_deductions = serializers.SerializerMethodField()
    gross_salary = serializers.SerializerMethodField()
    net_salary = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeeSalaryStructure
        fields = '__all__'
    
    def get_total_allowances(self, obj):
        return sum(float(a.amount) for a in obj.allowances.filter(is_active=True))
    
    def get_total_deductions(self, obj):
        return sum(float(d.amount) for d in obj.deductions.filter(is_active=True))
    
    def get_gross_salary(self, obj):
        return float(obj.basic_salary) + self.get_total_allowances(obj)
    
    def get_net_salary(self, obj):
        return self.get_gross_salary(obj) - self.get_total_deductions(obj)


class PayslipAllowanceSerializer(serializers.ModelSerializer):
    allowance_name = serializers.CharField(source='allowance_type.name', read_only=True)
    
    class Meta:
        model = PayslipAllowance
        fields = '__all__'


class PayslipDeductionSerializer(serializers.ModelSerializer):
    deduction_name = serializers.CharField(source='deduction_type.name', read_only=True)
    
    class Meta:
        model = PayslipDeduction
        fields = '__all__'


class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id_number = serializers.CharField(source='employee.employee_id', read_only=True)
    designation = serializers.CharField(source='employee.designation.name', read_only=True)
    department = serializers.CharField(source='employee.department.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.username', read_only=True)
    allowance_items = PayslipAllowanceSerializer(many=True, read_only=True)
    deduction_items = PayslipDeductionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Payslip
        fields = '__all__'


class PayslipCreateSerializer(serializers.Serializer):
    """Serializer for bulk payslip generation"""
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of employee IDs. If empty, generates for all active employees"
    )
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField(min_value=2020, max_value=2100)
    payment_method = serializers.CharField(required=False, default='Bank Transfer')


# ==================== LEAVE MANAGEMENT SERIALIZERS ====================

class LeavePolicyRuleSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    leave_type_details = serializers.SerializerMethodField()
    
    class Meta:
        model = LeavePolicyRule
        fields = '__all__'
    
    def get_leave_type_details(self, obj):
        return {
            'id': obj.leave_type.id,
            'name': obj.leave_type.name,
            'is_paid': obj.leave_type.is_paid
        }


class LeavePolicySerializer(serializers.ModelSerializer):
    designation_name = serializers.CharField(source='designation.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    rules = LeavePolicyRuleSerializer(many=True, read_only=True)
    total_annual_leaves = serializers.SerializerMethodField()
    
    class Meta:
        model = LeavePolicy
        fields = '__all__'
    
    def get_total_annual_leaves(self, obj):
        return sum(rule.annual_quota for rule in obj.rules.all())


class EmployeeLeaveBalanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id_number = serializers.CharField(source='employee.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    leave_type_is_paid = serializers.BooleanField(source='leave_type.is_paid', read_only=True)
    available = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeeLeaveBalance
        fields = '__all__'
    
    def get_available(self, obj):
        return obj.available()


class LeaveBalanceInitSerializer(serializers.Serializer):
    """Serializer for initializing leave balances"""
    year = serializers.IntegerField()
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="Employee IDs. If empty, initializes for all active employees"
    )


class LeaveApplicationSerializer(serializers.ModelSerializer):
    """Phase 3 Leave Application Serializer"""
    applicant_name = serializers.CharField(source='applicant.name', read_only=True)
    applicant_employee_id = serializers.CharField(source='applicant.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    leave_type_is_paid = serializers.BooleanField(source='leave_type.is_paid', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)
    total_days = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveApplication
        fields = '__all__'
        read_only_fields = ['applied_at', 'approved_by', 'approved_at']
    
    def get_total_days(self, obj):
        if obj.from_date and obj.to_date:
            return (obj.to_date - obj.from_date).days + 1
        return 0


# ==================== EXPENSE MANAGEMENT SERIALIZERS ====================

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'


class ExpenseClaimSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id_number = serializers.CharField(source='employee.employee_id', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)
    days_pending = serializers.SerializerMethodField()
    
    class Meta:
        model = ExpenseClaim
        fields = '__all__'
        read_only_fields = ['claim_number', 'submitted_at', 'approved_at']
    
    def get_days_pending(self, obj):
        if obj.status in ['draft', 'submitted']:
            date_to_compare = obj.submitted_at or obj.created_at
            return (timezone.now() - date_to_compare).days
        return 0


class ExpenseApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting expenses"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_date = serializers.DateField(required=False)


# ==================== ASSET MANAGEMENT SERIALIZERS ====================

class AssetCategorySerializer(serializers.ModelSerializer):
    asset_count = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()
    
    class Meta:
        model = AssetCategory
        fields = '__all__'
    
    def get_asset_count(self, obj):
        return obj.assets.filter(status__in=['available', 'assigned', 'maintenance']).count()
    
    def get_total_value(self, obj):
        assets = obj.assets.filter(status__in=['available', 'assigned', 'maintenance'])
        return sum(float(a.current_value) for a in assets)


class AssetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_details = AssetCategorySerializer(source='category', read_only=True)
    current_assignment = serializers.SerializerMethodField()
    depreciation_amount = serializers.SerializerMethodField()
    age_years = serializers.SerializerMethodField()
    
    class Meta:
        model = Asset
        fields = '__all__'
    
    def get_current_assignment(self, obj):
        assignment = obj.assignments.filter(is_active=True).first()
        if assignment:
            return {
                'employee_id': assignment.employee.id,
                'employee_name': assignment.employee.name,
                'assigned_date': assignment.assigned_date,
                'expected_return_date': assignment.expected_return_date
            }
        return None
    
    def get_depreciation_amount(self, obj):
        return float(obj.purchase_price) - float(obj.current_value)
    
    def get_age_years(self, obj):
        from datetime import date
        age_days = (date.today() - obj.purchase_date).days
        return round(age_days / 365.25, 1)


class AssetAssignmentSerializer(serializers.ModelSerializer):
    asset_details = serializers.SerializerMethodField()
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id_number = serializers.CharField(source='employee.employee_id', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.username', read_only=True)
    days_assigned = serializers.SerializerMethodField()
    
    class Meta:
        model = AssetAssignment
        fields = '__all__'
    
    def get_asset_details(self, obj):
        return {
            'id': obj.asset.id,
            'asset_code': obj.asset.asset_code,
            'name': obj.asset.name,
            'category': obj.asset.category.name if obj.asset.category else None
        }
    
    def get_days_assigned(self, obj):
        if obj.is_active:
            from datetime import date
            return (date.today() - obj.assigned_date).days
        elif obj.returned_date:
            return (obj.returned_date - obj.assigned_date).days
        return 0


class AssetMaintenanceSerializer(serializers.ModelSerializer):
    asset_details = serializers.SerializerMethodField()
    overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = AssetMaintenance
        fields = '__all__'
    
    def get_asset_details(self, obj):
        return {
            'id': obj.asset.id,
            'asset_code': obj.asset.asset_code,
            'name': obj.asset.name,
            'category': obj.asset.category.name if obj.asset.category else None,
            'status': obj.asset.status
        }
    
    def get_overdue(self, obj):
        if obj.status in ['scheduled', 'in_progress']:
            from datetime import date
            return obj.scheduled_date < date.today()
        return False


# ==================== ACCOUNTING SERIALIZERS ====================

class AccountGroupSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AccountGroup
        fields = '__all__'
    
    def get_children_count(self, obj):
        return obj.children.count()


class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_code = serializers.CharField(source='account.code', read_only=True)
    
    class Meta:
        model = JournalEntryLine
        fields = '__all__'


class JournalEntrySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    lines = JournalEntryLineSerializer(many=True, read_only=True)
    is_balanced = serializers.SerializerMethodField()
    
    class Meta:
        model = JournalEntry
        fields = '__all__'
        read_only_fields = ['entry_number', 'total_debit', 'total_credit', 'posted_at']
    
    def get_is_balanced(self, obj):
        return obj.is_balanced()


class JournalEntryCreateSerializer(serializers.Serializer):
    """Serializer for creating journal entries with lines"""
    entry_date = serializers.DateField()
    description = serializers.CharField(style={'base_template': 'textarea.html'})
    reference = serializers.CharField(required=False, allow_blank=True)
    lines = serializers.ListField(
        child=serializers.DictField(),
        min_length=2,
        help_text="List of line items with account_id, description, debit, credit"
    )
    
    def validate_lines(self, lines):
        """Validate that debits equal credits"""
        total_debit = sum(float(line.get('debit', 0)) for line in lines)
        total_credit = sum(float(line.get('credit', 0)) for line in lines)
        
        if abs(total_debit - total_credit) > 0.01:
            raise serializers.ValidationError(
                f"Debits ({total_debit}) must equal credits ({total_credit})"
            )
        
        # Validate each line has either debit or credit (not both)
        for line in lines:
            debit = float(line.get('debit', 0))
            credit = float(line.get('credit', 0))
            if debit > 0 and credit > 0:
                raise serializers.ValidationError(
                    "Each line must have either debit or credit, not both"
                )
            if debit == 0 and credit == 0:
                raise serializers.ValidationError(
                    "Each line must have either debit or credit amount"
                )
        
        return lines


class BudgetAllocationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_code = serializers.CharField(source='account.code', read_only=True)
    remaining_budget = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetAllocation
        fields = '__all__'
    
    def get_remaining_budget(self, obj):
        return obj.remaining_budget()
    
    def get_utilization_percentage(self, obj):
        return round(obj.budget_utilization_percentage(), 2)
    
    def get_status(self, obj):
        utilization = obj.budget_utilization_percentage()
        if utilization < 50:
            return 'healthy'
        elif utilization < 80:
            return 'moderate'
        elif utilization < 100:
            return 'high'
        else:
            return 'exceeded'
