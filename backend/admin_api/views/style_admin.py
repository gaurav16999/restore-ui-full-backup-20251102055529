from rest_framework import viewsets
from admin_api.models import ColorTheme, BackgroundSetting
from admin_api.serializers.style import ColorThemeSerializer, BackgroundSettingSerializer


class ColorThemeViewSet(viewsets.ModelViewSet):
    queryset = ColorTheme.objects.all().order_by('-created_at')
    serializer_class = ColorThemeSerializer


class BackgroundSettingViewSet(viewsets.ModelViewSet):
    queryset = BackgroundSetting.objects.all().order_by('-created_at')
    serializer_class = BackgroundSettingSerializer
