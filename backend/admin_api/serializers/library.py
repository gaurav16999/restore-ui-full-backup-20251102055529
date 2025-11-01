from rest_framework import serializers
from admin_api.models import BookCategory, LibraryMember, Book, BookIssue


class BookCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCategory
        fields = '__all__'


class LibraryMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryMember
        fields = '__all__'


class BookSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(
        source='category.title', read_only=True)

    class Meta:
        model = Book
        fields = '__all__'


class BookIssueSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    member_name = serializers.CharField(source='member.name', read_only=True)

    class Meta:
        model = BookIssue
        fields = '__all__'
