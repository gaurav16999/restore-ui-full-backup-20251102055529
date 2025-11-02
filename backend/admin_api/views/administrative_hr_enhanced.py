"""
Administrative & HR Modules - Combined Imports
===============================================
Import all enhanced ViewSets for URL registration
"""

from .administrative_hr_enhanced_part1 import (
    LeaveManagementEnhancedViewSet,
    PayrollRunEnhancedViewSet,
    StaffAttendanceEnhancedViewSet,
    AccountingSystemEnhancedViewSet
)

from .administrative_hr_enhanced_part2 import (
    FeeManagementEnhancedViewSet,
    WalletSystemEnhancedViewSet,
    InventoryEnhancedViewSet,
    LibraryEnhancedViewSet,
    TransportEnhancedViewSet,
    DormitoryEnhancedViewSet
)

__all__ = [
    'LeaveManagementEnhancedViewSet',
    'PayrollRunEnhancedViewSet',
    'StaffAttendanceEnhancedViewSet',
    'AccountingSystemEnhancedViewSet',
    'FeeManagementEnhancedViewSet',
    'WalletSystemEnhancedViewSet',
    'InventoryEnhancedViewSet',
    'LibraryEnhancedViewSet',
    'TransportEnhancedViewSet',
    'DormitoryEnhancedViewSet'
]
