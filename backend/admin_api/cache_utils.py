"""
Caching utilities for performance optimization
"""
from django.core.cache import cache
from functools import wraps
import hashlib
import json


def generate_cache_key(prefix, *args, **kwargs):
    """Generate a unique cache key from arguments"""
    key_data = {
        'args': args,
        'kwargs': kwargs
    }
    key_string = json.dumps(key_data, sort_keys=True)
    key_hash = hashlib.md5(key_string.encode()).hexdigest()
    return f"{prefix}:{key_hash}"


def cache_result(timeout=300, key_prefix='cache'):
    """
    Decorator to cache function results

    Usage:
        @cache_result(timeout=600, key_prefix='student_list')
        def get_students():
            return Student.objects.all()
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = generate_cache_key(key_prefix, *args, **kwargs)

            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result

            # Execute function
            result = func(*args, **kwargs)

            # Store in cache
            cache.set(cache_key, result, timeout)

            return result
        return wrapper
    return decorator


def invalidate_cache(key_prefix, *args, **kwargs):
    """Invalidate a cached result"""
    cache_key = generate_cache_key(key_prefix, *args, **kwargs)
    cache.delete(cache_key)


def invalidate_pattern(pattern):
    """Invalidate all cache keys matching a pattern"""
    try:
        from django_redis import get_redis_connection
        conn = get_redis_connection("default")
        keys = conn.keys(f"*{pattern}*")
        if keys:
            conn.delete(*keys)
    except Exception as e:
        print(f"Error invalidating cache pattern: {e}")


class CacheManager:
    """Centralized cache management"""

    # Cache timeouts
    TIMEOUT_SHORT = 60  # 1 minute
    TIMEOUT_MEDIUM = 300  # 5 minutes
    TIMEOUT_LONG = 1800  # 30 minutes
    TIMEOUT_DAY = 86400  # 24 hours

    # Cache key prefixes
    PREFIX_STUDENT_LIST = 'student_list'
    PREFIX_TEACHER_LIST = 'teacher_list'
    PREFIX_CLASS_LIST = 'class_list'
    PREFIX_SUBJECT_LIST = 'subject_list'
    PREFIX_GRADE_LIST = 'grade_list'
    PREFIX_ATTENDANCE = 'attendance'
    PREFIX_EXAM_RESULTS = 'exam_results'
    PREFIX_DASHBOARD_STATS = 'dashboard_stats'

    @staticmethod
    def get_student_list(filters=None):
        """Get cached student list"""
        key = generate_cache_key(
            CacheManager.PREFIX_STUDENT_LIST,
            filters or {})
        return cache.get(key)

    @staticmethod
    def set_student_list(data, filters=None, timeout=TIMEOUT_MEDIUM):
        """Cache student list"""
        key = generate_cache_key(
            CacheManager.PREFIX_STUDENT_LIST,
            filters or {})
        cache.set(key, data, timeout)

    @staticmethod
    def invalidate_student_cache():
        """Invalidate all student-related cache"""
        invalidate_pattern(CacheManager.PREFIX_STUDENT_LIST)

    @staticmethod
    def get_dashboard_stats(user_id, role):
        """Get cached dashboard statistics"""
        key = f"{CacheManager.PREFIX_DASHBOARD_STATS}:{role}:{user_id}"
        return cache.get(key)

    @staticmethod
    def set_dashboard_stats(user_id, role, data):
        """Cache dashboard statistics"""
        key = f"{CacheManager.PREFIX_DASHBOARD_STATS}:{role}:{user_id}"
        cache.set(key, data, CacheManager.TIMEOUT_SHORT)

    @staticmethod
    def invalidate_dashboard_cache(user_id=None, role=None):
        """Invalidate dashboard cache"""
        if user_id and role:
            key = f"{CacheManager.PREFIX_DASHBOARD_STATS}:{role}:{user_id}"
            cache.delete(key)
        else:
            invalidate_pattern(CacheManager.PREFIX_DASHBOARD_STATS)

    @staticmethod
    def get_or_set(key, callback, timeout=TIMEOUT_MEDIUM):
        """Get from cache or execute callback and cache result"""
        result = cache.get(key)
        if result is None:
            result = callback()
            cache.set(key, result, timeout)
        return result


# View-level caching decorator
def cache_view(timeout=300):
    """
    Decorator for caching view responses

    Usage:
        @cache_view(timeout=600)
        @api_view(['GET'])
        def my_view(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key from request
            cache_key = generate_cache_key(
                'view',
                request.path,
                request.method,
                request.GET.dict()
            )

            # Try cache
            response = cache.get(cache_key)
            if response is not None:
                return response

            # Execute view
            response = view_func(request, *args, **kwargs)

            # Cache response
            if response.status_code == 200:
                cache.set(cache_key, response, timeout)

            return response
        return wrapper
    return decorator


# Database query optimization helpers
def prefetch_related_optimized(queryset, *related):
    """
    Optimized prefetch_related with select_related
    """
    return queryset.select_related(*related).prefetch_related(*related)


def bulk_create_optimized(model, objects, batch_size=1000):
    """
    Optimized bulk create with batching
    """
    total = len(objects)
    created = 0

    for i in range(0, total, batch_size):
        batch = objects[i:i + batch_size]
        model.objects.bulk_create(batch, ignore_conflicts=True)
        created += len(batch)

    return created


# Example usage in views:
"""
from admin_api.cache_utils import CacheManager, cache_result

@api_view(['GET'])
def get_students(request):
    # Try cache first
    cached_data = CacheManager.get_student_list(request.GET.dict())
    if cached_data:
        return Response(cached_data)

    # Query database
    students = Student.objects.all()
    data = StudentSerializer(students, many=True).data

    # Cache results
    CacheManager.set_student_list(data, request.GET.dict())

    return Response(data)

# When creating/updating students, invalidate cache:
@api_view(['POST'])
def create_student(request):
    # ... create student ...
    CacheManager.invalidate_student_cache()
    return Response(...)
"""
