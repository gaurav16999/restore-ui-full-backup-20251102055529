import logging
import json
from django.http import JsonResponse
from django.contrib.contenttypes.models import ContentType
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class ExceptionToJSONMiddleware:
    """Middleware to convert unhandled exceptions into JSON responses for API requests.

    - If the request path starts with /api/, return a JSON response with status 500 and
      a minimal error payload instead of HTML traceback. This prevents the frontend
      from receiving HTML and mis-parsing responses.
    - Logs the exception with stacktrace for debugging.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as exc:
            # Log full traceback
            logger.exception(
                'Unhandled exception while handling request: %s %s',
                request.method,
                request.path)

            # Only return JSON for API paths
            try:
                if request.path.startswith('/api/'):
                    data = {
                        'detail': 'Internal server error',
                        'message': str(exc),
                    }
                    return JsonResponse(data, status=500)
            except Exception:
                # Fallback: still re-raise if JSON response cannot be generated
                pass

            # Re-raise for non-API or if JSON response failed so Django can
            # render default error page
            raise


class AuditLogMiddleware(MiddlewareMixin):
    """Middleware to automatically create audit logs for API operations"""
    
    def process_response(self, request, response):
        # Only log API requests
        if not request.path.startswith('/api/'):
            return response
        
        # Skip certain paths
        skip_paths = ['/api/auth/token/', '/api/health/', '/api/admin/notifications/']
        if any(request.path.startswith(path) for path in skip_paths):
            return response
        
        # Only log authenticated requests
        if not request.user or not request.user.is_authenticated:
            return response
        
        # Only log successful operations
        if response.status_code not in [200, 201, 204]:
            return response
        
        # Determine action based on HTTP method
        action_map = {
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
            'GET': 'view',
        }
        
        action = action_map.get(request.method, 'view')
        
        # Create audit log asynchronously to avoid performance impact
        try:
            from .models_audit import AuditLog
            
            # Extract IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Extract model name from path
            path_parts = request.path.strip('/').split('/')
            model_name = path_parts[2] if len(path_parts) > 2 else ''
            
            AuditLog.objects.create(
                user=request.user,
                action=action,
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                model_name=model_name,
                description=f"{request.method} {request.path}"
            )
        except Exception as e:
            # Don't let audit logging break the request
            logger.error(f"Failed to create audit log: {e}")
        
        return response
