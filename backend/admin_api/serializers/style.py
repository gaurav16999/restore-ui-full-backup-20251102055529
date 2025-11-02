from rest_framework import serializers
from admin_api.models import ColorTheme, BackgroundSetting


class ColorThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorTheme
        fields = '__all__'


class BackgroundSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackgroundSetting
        fields = '__all__'
