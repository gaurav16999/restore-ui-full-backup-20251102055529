from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from admin_api.models import BookCategory, LibraryMember, Book, BookIssue
from admin_api.serializers.library import (
    BookCategorySerializer,
    LibraryMemberSerializer,
    BookSerializer,
    BookIssueSerializer)


class BookCategoryViewSet(viewsets.ModelViewSet):
    queryset = BookCategory.objects.all()
    serializer_class = BookCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title']
    ordering_fields = ['title', 'created_at']


class LibraryMemberViewSet(viewsets.ModelViewSet):
    queryset = LibraryMember.objects.all()
    serializer_class = LibraryMemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'member_id']
    ordering_fields = ['name', 'created_at']


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'isbn', 'book_no']
    ordering_fields = ['title', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset


class BookIssueViewSet(viewsets.ModelViewSet):
    queryset = BookIssue.objects.all()
    serializer_class = BookIssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['book__title', 'member__name']
    ordering_fields = ['issue_date', 'due_date']

    def get_queryset(self):
        queryset = super().get_queryset()
        member = self.request.query_params.get('member')
        book = self.request.query_params.get('book')
        status = self.request.query_params.get('status')
        if member:
            queryset = queryset.filter(member_id=member)
        if book:
            queryset = queryset.filter(book_id=book)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
