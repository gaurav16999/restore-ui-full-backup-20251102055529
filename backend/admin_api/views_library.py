from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models_library import Book, BookCategory, BookIssue
from .serializers_library import BookSerializer, BookCategorySerializer, BookIssueSerializer

class BookCategoryViewSet(viewsets.ModelViewSet):
    queryset = BookCategory.objects.all()
    serializer_class = BookCategorySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def books(self, request, pk=None):
        """Get all books in a category"""
        category = self.get_object()
        books = category.books.all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('category').all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filters
        status_filter = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category:
            queryset = queryset.filter(category_id=category)
        if search:
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(
                author__icontains=search
            ) | queryset.filter(
                isbn__icontains=search
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available books"""
        books = self.queryset.filter(available_quantity__gt=0, status='available')
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def issue_history(self, request, pk=None):
        """Get issue history for a book"""
        book = self.get_object()
        issues = book.issues.all()
        serializer = BookIssueSerializer(issues, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get library statistics"""
        total_books = Book.objects.count()
        total_quantity = Book.objects.aggregate(total=models.Sum('quantity'))['total'] or 0
        available_books = Book.objects.filter(available_quantity__gt=0).count()
        issued_books = BookIssue.objects.filter(status='issued').count()
        overdue_books = BookIssue.objects.filter(
            status='issued',
            due_date__lt=timezone.now()
        ).count()
        
        return Response({
            'total_books': total_books,
            'total_quantity': total_quantity,
            'available_books': available_books,
            'issued_books': issued_books,
            'overdue_books': overdue_books,
            'categories': BookCategory.objects.count(),
        })

class BookIssueViewSet(viewsets.ModelViewSet):
    queryset = BookIssue.objects.select_related('book', 'student', 'teacher', 'issued_by').all()
    serializer_class = BookIssueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filters
        status_filter = self.request.query_params.get('status')
        student_id = self.request.query_params.get('student')
        teacher_id = self.request.query_params.get('teacher')
        overdue = self.request.query_params.get('overdue')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        if overdue == 'true':
            queryset = queryset.filter(status='issued', due_date__lt=timezone.now())
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Issue a book"""
        book_id = request.data.get('book')
        issued_to_type = request.data.get('issued_to_type')
        days = int(request.data.get('days', 14))  # Default 14 days
        
        try:
            book = Book.objects.get(id=book_id)
            
            if book.available_quantity <= 0:
                return Response(
                    {'error': 'Book not available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set due date
            due_date = timezone.now() + timedelta(days=days)
            
            # Create issue
            issue_data = request.data.copy()
            issue_data['due_date'] = due_date
            issue_data['issued_by'] = request.user.id
            
            serializer = self.get_serializer(data=issue_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Book.DoesNotExist:
            return Response(
                {'error': 'Book not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        """Return a book"""
        issue = self.get_object()
        
        if issue.status != 'issued':
            return Response(
                {'error': 'Book already returned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        issue.return_date = timezone.now()
        issue.status = 'returned'
        
        # Calculate and update fine
        fine = issue.calculate_fine()
        issue.fine_amount = fine
        issue.save()
        
        # Update book availability
        issue.book.available_quantity += 1
        issue.book.save()
        
        serializer = self.get_serializer(issue)
        return Response({
            'message': 'Book returned successfully',
            'fine_amount': fine,
            'issue': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def pay_fine(self, request, pk=None):
        """Mark fine as paid"""
        issue = self.get_object()
        
        if issue.fine_paid:
            return Response(
                {'error': 'Fine already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        issue.fine_paid = True
        issue.save()
        
        serializer = self.get_serializer(issue)
        return Response({
            'message': 'Fine paid successfully',
            'issue': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Renew book issue (extend due date)"""
        issue = self.get_object()
        
        if issue.status != 'issued':
            return Response(
                {'error': 'Only issued books can be renewed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        days = int(request.data.get('days', 14))
        issue.due_date = issue.due_date + timedelta(days=days)
        issue.save()
        
        serializer = self.get_serializer(issue)
        return Response({
            'message': 'Book renewed successfully',
            'new_due_date': issue.due_date,
            'issue': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get all overdue books"""
        overdue_issues = self.queryset.filter(
            status='issued',
            due_date__lt=timezone.now()
        )
        serializer = self.get_serializer(overdue_issues, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_issues(self, request):
        """Get current user's book issues"""
        user = request.user
        
        if hasattr(user, 'student'):
            issues = self.queryset.filter(student=user.student)
        elif hasattr(user, 'teacher'):
            issues = self.queryset.filter(teacher=user.teacher)
        else:
            return Response([])
        
        serializer = self.get_serializer(issues, many=True)
        return Response(serializer.data)

from django.db import models
