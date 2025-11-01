from django.db import models
from users.models import Student, Teacher
from django.utils import timezone

class BookCategory(models.Model):
    """Book categories for library classification"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'library_book_category'
        verbose_name_plural = 'Book Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Book(models.Model):
    """Library books inventory"""
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('issued', 'Issued'),
        ('maintenance', 'Under Maintenance'),
        ('lost', 'Lost'),
        ('damaged', 'Damaged'),
    ]
    
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=20, unique=True, null=True, blank=True)
    category = models.ForeignKey(BookCategory, on_delete=models.SET_NULL, null=True, related_name='books')
    publisher = models.CharField(max_length=255, blank=True)
    publication_year = models.IntegerField(null=True, blank=True)
    edition = models.CharField(max_length=50, blank=True)
    pages = models.IntegerField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    available_quantity = models.IntegerField(default=1)
    rack_number = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    description = models.TextField(blank=True)
    cover_image = models.CharField(max_length=500, blank=True)
    added_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'library_book'
        ordering = ['-added_date']
    
    def __str__(self):
        return f"{self.title} - {self.author}"

class BookIssue(models.Model):
    """Track book issues to students/teachers"""
    ISSUED_TO_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    ]
    
    STATUS_CHOICES = [
        ('issued', 'Issued'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
        ('lost', 'Lost'),
    ]
    
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='issues')
    issued_to_type = models.CharField(max_length=10, choices=ISSUED_TO_CHOICES)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='book_issues')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True, related_name='book_issues')
    issue_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField()
    return_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='issued')
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fine_paid = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    issued_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='books_issued')
    
    class Meta:
        db_table = 'library_book_issue'
        ordering = ['-issue_date']
    
    def __str__(self):
        issued_to = self.student if self.student else self.teacher
        return f"{self.book.title} - {issued_to}"
    
    def calculate_fine(self, daily_fine=5):
        """Calculate fine for overdue books"""
        if self.status == 'returned' and self.return_date:
            if self.return_date > self.due_date:
                days_late = (self.return_date - self.due_date).days
                return days_late * daily_fine
        elif self.status == 'issued':
            if timezone.now() > self.due_date:
                days_late = (timezone.now() - self.due_date).days
                return days_late * daily_fine
        return 0
    
    def save(self, *args, **kwargs):
        # Update book available quantity
        if self.pk is None:  # New issue
            self.book.available_quantity -= 1
            self.book.save()
        super().save(*args, **kwargs)
