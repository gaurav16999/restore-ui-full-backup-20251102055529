import os
import django
import sys
from datetime import datetime, timedelta
from decimal import Decimal

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_backend.settings')
django.setup()

from admin_api.models import FeeStructure, FeePayment, Student, Class, User
from django.utils import timezone

def create_fee_structures():
    """Create fee structures for different classes and fee types"""
    print("Creating fee structures...")
    
    # Get all students
    students = Student.objects.all()
    
    if not students.exists():
        print("❌ No students found! Please create students first.")
        return []
    
    # Get unique class names from students
    student_class_names = students.values_list('class_name', flat=True).distinct()
    
    # Get Class objects that match student class names
    classes_with_students = Class.objects.filter(name__in=student_class_names)
    
    if not classes_with_students.exists():
        print("❌ No matching Class records found for student class names!")
        print(f"ℹ️  Student class names found: {list(student_class_names)}")
        return []
    
    print(f"📊 Found {classes_with_students.count()} classes with students")
    
    fee_structures = []
    
    # Define fee types for each class (amounts in Nepalese Rupees)
    fee_configs = [
        {
            'name': 'Annual Tuition Fee',
            'fee_type': 'tuition',
            'amount': Decimal('50000.00'),
            'frequency': 'yearly',
            'is_mandatory': True,
            'description': 'Annual tuition fee for academic year 2024-2025'
        },
        {
            'name': 'Library Fee',
            'fee_type': 'library',
            'amount': Decimal('5000.00'),
            'frequency': 'yearly',
            'is_mandatory': True,
            'description': 'Annual library membership and book access fee'
        },
        {
            'name': 'Laboratory Fee',
            'fee_type': 'lab',
            'amount': Decimal('15000.00'),
            'frequency': 'yearly',
            'is_mandatory': True,
            'description': 'Science laboratory equipment and materials fee'
        },
        {
            'name': 'Sports Fee',
            'fee_type': 'sports',
            'amount': Decimal('8000.00'),
            'frequency': 'yearly',
            'is_mandatory': False,
            'description': 'Sports facilities and equipment fee'
        },
        {
            'name': 'Computer Lab Fee',
            'fee_type': 'computer',
            'amount': Decimal('12000.00'),
            'frequency': 'yearly',
            'is_mandatory': True,
            'description': 'Computer lab access and software licenses'
        },
        {
            'name': 'Examination Fee',
            'fee_type': 'exam',
            'amount': Decimal('6000.00'),
            'frequency': 'half_yearly',
            'is_mandatory': True,
            'description': 'Half-yearly examination fee'
        },
        {
            'name': 'Transport Fee',
            'fee_type': 'transport',
            'amount': Decimal('20000.00'),
            'frequency': 'yearly',
            'is_mandatory': False,
            'description': 'School bus transportation fee (optional)'
        },
        {
            'name': 'Development Fee',
            'fee_type': 'development',
            'amount': Decimal('10000.00'),
            'frequency': 'yearly',
            'is_mandatory': True,
            'description': 'School development and infrastructure fund'
        }
    ]
    
    # Set due dates
    tuition_due = timezone.now().date() + timedelta(days=30)  # 30 days from now
    exam_due = timezone.now().date() + timedelta(days=45)     # 45 days from now
    yearly_due = timezone.now().date() + timedelta(days=60)   # 60 days from now
    
    # Create fee structures for each class that has students
    for class_obj in classes_with_students:
        for config in fee_configs:
            # Determine due date based on frequency
            if config['fee_type'] == 'exam':
                due_date = exam_due
            elif config['fee_type'] == 'tuition':
                due_date = tuition_due
            else:
                due_date = yearly_due
            
            fee_structure, created = FeeStructure.objects.get_or_create(
                name=config['name'],
                fee_type=config['fee_type'],
                class_assigned=class_obj,
                defaults={
                    'amount': config['amount'],
                    'frequency': config['frequency'],
                    'is_mandatory': config['is_mandatory'],
                    'is_active': True,
                    'due_date': due_date,
                    'description': config['description'],
                    'grade_level': class_obj.name
                }
            )
            
            if created:
                fee_structures.append(fee_structure)
                print(f"✅ Created: {fee_structure.name} for {class_obj.name} - Rs.{fee_structure.amount}")
            else:
                print(f"ℹ️  Already exists: {fee_structure.name} for {class_obj.name}")
    
    print(f"\n✅ Created {len(fee_structures)} new fee structures")
    return fee_structures


def create_fee_payments():
    """Create fee payment records for students"""
    print("\nCreating fee payment records...")
    
    # Get all students
    students = Student.objects.all()
    
    if not students.exists():
        print("❌ No students found! Please create students first.")
        return
    
    # Get all fee structures
    fee_structures = FeeStructure.objects.filter(is_active=True)
    
    if not fee_structures.exists():
        print("❌ No fee structures found!")
        return
    
    payments_created = 0
    invoice_counter = 1000
    
    for student in students:
        # Get fee structures for student's class
        student_class = Class.objects.filter(name=student.class_name).first()
        
        if not student_class:
            print(f"⚠️  Student {student.user.get_full_name()} has no valid class")
            continue
        
        class_fees = fee_structures.filter(class_assigned=student_class)
        
        for fee_structure in class_fees:
            # Generate unique invoice number
            invoice_number = f"INV-{timezone.now().year}-{invoice_counter:05d}"
            invoice_counter += 1
            
            # Randomly determine payment status for variety
            import random
            payment_scenarios = [
                {'status': 'paid', 'paid_percentage': 1.0},      # Fully paid
                {'status': 'partial', 'paid_percentage': 0.5},   # Half paid
                {'status': 'pending', 'paid_percentage': 0.0},   # Not paid
                {'status': 'paid', 'paid_percentage': 1.0},      # Fully paid (more common)
            ]
            
            scenario = random.choice(payment_scenarios)
            amount_due = fee_structure.amount
            amount_paid = amount_due * Decimal(str(scenario['paid_percentage']))
            
            # Set payment date if paid
            payment_date = None
            payment_method = None
            transaction_id = ''  # Default empty string instead of None
            
            if scenario['status'] == 'paid':
                # Random date in the past month
                days_ago = random.randint(1, 30)
                payment_date = timezone.now().date() - timedelta(days=days_ago)
                payment_methods = ['cash', 'bank_transfer', 'online', 'upi', 'card']
                payment_method = random.choice(payment_methods)
                transaction_id = f"TXN{random.randint(100000, 999999)}"
            elif scenario['status'] == 'partial':
                # Partial payment made recently
                days_ago = random.randint(5, 20)
                payment_date = timezone.now().date() - timedelta(days=days_ago)
                payment_methods = ['cash', 'bank_transfer', 'online', 'upi']
                payment_method = random.choice(payment_methods)
                transaction_id = f"TXN{random.randint(100000, 999999)}"
            
            # Check if payment already exists
            existing_payment = FeePayment.objects.filter(
                student=student,
                fee_structure=fee_structure,
                invoice_number=invoice_number
            ).first()
            
            if existing_payment:
                continue
            
            # Create payment record
            payment = FeePayment.objects.create(
                student=student,
                fee_structure=fee_structure,
                invoice_number=invoice_number,
                amount_due=amount_due,
                amount_paid=amount_paid,
                payment_method=payment_method,
                transaction_id=transaction_id,
                status=scenario['status'],
                payment_date=payment_date,
                due_date=fee_structure.due_date,
                late_fee=Decimal('0.00'),
                discount=Decimal('0.00'),
                remarks=f"Payment for {fee_structure.name}"
            )
            
            payments_created += 1
            
            status_icon = "✅" if scenario['status'] == 'paid' else "⏳" if scenario['status'] == 'partial' else "❌"
            print(f"{status_icon} Created payment: {invoice_number} - {student.user.get_full_name()} - {fee_structure.name} - Rs.{amount_paid}/Rs.{amount_due} ({scenario['status']})")
    
    print(f"\n✅ Created {payments_created} fee payment records")


def main():
    print("=" * 80)
    print("FEE DATA CREATION SCRIPT")
    print("=" * 80)
    
    try:
        # Check if we have required data
        if not Student.objects.exists():
            print("\n❌ ERROR: No students found in the database!")
            print("Please run create_sample_data.py first to create students.")
            return
        
        # Get unique class names from students
        student_class_names = Student.objects.values_list('class_name', flat=True).distinct()
        
        # Get classes that match student class names
        classes_with_students = Class.objects.filter(name__in=student_class_names)
        
        if not classes_with_students.exists():
            print("\n❌ ERROR: No Class records found matching student class names!")
            print(f"ℹ️  Student class names: {list(student_class_names)}")
            return
        
        total_students = Student.objects.count()
        print(f"\n📊 Found {classes_with_students.count()} classes with students")
        print(f"📊 Found {total_students} students")
        
        # Show which classes have students
        print("\nℹ️  Classes with students:")
        for class_obj in classes_with_students:
            student_count = Student.objects.filter(class_name=class_obj.name).count()
            print(f"   - {class_obj.name}: {student_count} student(s)")
        
        # Create fee structures
        print("\n" + "-" * 80)
        fee_structures = create_fee_structures()
        
        # Create fee payments
        print("\n" + "-" * 80)
        create_fee_payments()
        
        # Display summary
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Total Fee Structures: {FeeStructure.objects.count()}")
        print(f"Active Fee Structures: {FeeStructure.objects.filter(is_active=True).count()}")
        print(f"Total Fee Payments: {FeePayment.objects.count()}")
        print(f"Paid Payments: {FeePayment.objects.filter(status='paid').count()}")
        print(f"Pending Payments: {FeePayment.objects.filter(status='pending').count()}")
        print(f"Partial Payments: {FeePayment.objects.filter(status='partial').count()}")
        
        total_due = FeePayment.objects.aggregate(total=django.db.models.Sum('amount_due'))['total'] or 0
        total_paid = FeePayment.objects.aggregate(total=django.db.models.Sum('amount_paid'))['total'] or 0
        
        print(f"\n💰 Total Amount Due: Rs.{total_due}")
        print(f"💰 Total Amount Paid: Rs.{total_paid}")
        print(f"💰 Total Outstanding: Rs.{total_due - total_paid}")
        
        print("\n✅ Fee data created successfully!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
