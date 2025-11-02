"""
Accounting & Finance Module Models - Double Entry Accounting
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
from users.models import User


class AccountType(models.Model):
    """Chart of Accounts - Account Types"""
    TYPE_CHOICES = (
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('revenue', 'Revenue'),
        ('expense', 'Expense'),
    )
    
    NORMAL_BALANCE_CHOICES = (
        ('debit', 'Debit'),
        ('credit', 'Credit'),
    )
    
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    normal_balance = models.CharField(max_length=10, choices=NORMAL_BALANCE_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.code} - {self.name} ({self.type})"


class Account(models.Model):
    """Chart of Accounts - Individual Accounts"""
    account_type = models.ForeignKey(AccountType, on_delete=models.PROTECT, related_name='accounts')
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    parent_account = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_accounts'
    )
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    is_system_account = models.BooleanField(default=False, help_text="System-managed account")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class FiscalYear(models.Model):
    """Fiscal year configuration"""
    name = models.CharField(max_length=50, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.is_current:
            FiscalYear.objects.filter(is_current=True).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


class JournalEntry(models.Model):
    """Double-entry journal entries"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('voided', 'Voided'),
    )
    
    entry_number = models.CharField(max_length=50, unique=True)
    entry_date = models.DateField(default=timezone.now)
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.PROTECT, related_name='journal_entries')
    description = models.TextField()
    reference = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_journal_entries')
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='posted_journal_entries')
    posted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-entry_date', '-entry_number']
        verbose_name_plural = "Journal Entries"
    
    def __str__(self):
        return f"{self.entry_number} - {self.entry_date}"
    
    @property
    def total_debit(self):
        return sum(line.debit_amount for line in self.lines.all())
    
    @property
    def total_credit(self):
        return sum(line.credit_amount for line in self.lines.all())
    
    @property
    def is_balanced(self):
        return self.total_debit == self.total_credit


class JournalEntryLine(models.Model):
    """Individual debit/credit lines in journal entry"""
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='journal_lines')
    description = models.CharField(max_length=200, blank=True)
    debit_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    credit_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    def __str__(self):
        return f"{self.journal_entry.entry_number} - {self.account.name}"
    
    class Meta:
        ordering = ['id']


class Ledger(models.Model):
    """Account ledger (posted transactions)"""
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='ledger_entries')
    journal_entry_line = models.OneToOneField(JournalEntryLine, on_delete=models.CASCADE, related_name='ledger_entry')
    transaction_date = models.DateField()
    description = models.CharField(max_length=200)
    debit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    credit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.PROTECT, related_name='ledger_entries')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['transaction_date', 'id']
    
    def __str__(self):
        return f"{self.account.name} - {self.transaction_date}"


class BudgetPlan(models.Model):
    """Annual budget planning"""
    name = models.CharField(max_length=200)
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.CASCADE, related_name='budgets')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='budgets')
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    variance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_budgets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['fiscal_year', 'account']
        ordering = ['account__code']
    
    def __str__(self):
        return f"{self.name} - {self.account.name}"


class IncomeCategory(models.Model):
    """Income categories for revenue tracking"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='income_categories')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Income Categories"
    
    def __str__(self):
        return self.name


class ExpenseCategory(models.Model):
    """Expense categories for cost tracking"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='expense_categories')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Expense Categories"
    
    def __str__(self):
        return self.name


class Income(models.Model):
    """Income/Revenue records"""
    income_category = models.ForeignKey(IncomeCategory, on_delete=models.PROTECT, related_name='income_records')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    income_date = models.DateField(default=timezone.now)
    description = models.TextField()
    reference = models.CharField(max_length=100, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.SET_NULL, null=True, blank=True, related_name='income_records')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_income')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-income_date']
    
    def __str__(self):
        return f"{self.income_category.name} - {self.amount} - {self.income_date}"


class Expense(models.Model):
    """Expense records"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
    )
    
    expense_category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT, related_name='expense_records')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    expense_date = models.DateField(default=timezone.now)
    description = models.TextField()
    reference = models.CharField(max_length=100, blank=True)
    invoice_number = models.CharField(max_length=50, blank=True)
    vendor_name = models.CharField(max_length=200, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    attachment = models.FileField(upload_to='expenses/', blank=True, null=True)
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.SET_NULL, null=True, blank=True, related_name='expense_records')
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='requested_expenses')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_expenses')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-expense_date']
    
    def __str__(self):
        return f"{self.expense_category.name} - {self.amount} - {self.expense_date}"
