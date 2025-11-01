from rest_framework import serializers
from .models_library import Book, BookCategory, BookIssue

class BookCategorySerializer(serializers.ModelSerializer):
    books_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BookCategory
        fields = ['id', 'name', 'description', 'books_count', 'created_at']
    
    def get_books_count(self, obj):
        return obj.books.count()

class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    issued_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'category', 'category_name',
                  'publisher', 'publication_year', 'edition', 'pages', 'price',
                  'quantity', 'available_quantity', 'rack_number', 'status',
                  'description', 'cover_image', 'added_date', 'issued_count']
    
    def get_issued_count(self, obj):
        return obj.issues.filter(status='issued').count()

class BookIssueSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    issued_to_name = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    calculated_fine = serializers.SerializerMethodField()
    
    class Meta:
        model = BookIssue
        fields = ['id', 'book', 'book_title', 'book_author', 'issued_to_type',
                  'student', 'teacher', 'issued_to_name', 'issue_date', 'due_date',
                  'return_date', 'status', 'fine_amount', 'fine_paid', 'notes',
                  'issued_by', 'days_remaining', 'calculated_fine']
    
    def get_issued_to_name(self, obj):
        if obj.student:
            return f"{obj.student.user.first_name} {obj.student.user.last_name}"
        elif obj.teacher:
            return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"
        return "Unknown"
    
    def get_days_remaining(self, obj):
        if obj.status == 'issued':
            from django.utils import timezone
            days = (obj.due_date - timezone.now()).days
            return days
        return None
    
    def get_calculated_fine(self, obj):
        return obj.calculate_fine()
