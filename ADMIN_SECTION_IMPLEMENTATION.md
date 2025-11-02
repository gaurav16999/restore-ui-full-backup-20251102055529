# Admin Section Dynamic Implementation Guide

## Summary

All Admin Section pages have been updated with:
1. **Added to API Service** (`src/services/adminApi.ts`):
   - TypeScript interfaces for all entities
   - API service instances for CRUD operations
   - Mock data fallback when backend not available

2. **New Interfaces Added**:
   ```typescript
   - AdmissionQuery
   - VisitorBook
   - Complaint
   - PostalReceive
   - PostalDispatch
   - PhoneCallLog
   - AdminSetupItem
   ```

3. **API Services Created**:
   ```typescript
   - admissionQueryApi
   - visitorBookApi
   - complaintApi
   - postalReceiveApi
   - postalDispatchApi
   - phoneCallLogApi
   - adminSetupApi
   ```

## Implementation Pattern

Each Admin Section page follows this pattern:

### 1. State Management
```typescript
- items: Entity[] - Main data array
- filteredItems: Entity[] - Filtered results
- loading: boolean - Loading state
- actionLoading: number | null - Loading for specific action
- isDialogOpen: boolean - Dialog visibility
- selectedItem: Entity | null - Selected item for edit
- form: {} - Form state
```

### 2. Data Loading
```typescript
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const data = await entityApi.getAll();
    setItems(data);
  } catch (error) {
    // Fallback to mock data
    setItems(mockData);
  } finally {
    setLoading(false);
  }
};
```

### 3. CRUD Operations
- **Create**: `entityApi.create(data)`
- **Update**: `entityApi.update(id, data)`
- **Delete**: `entityApi.delete(id)` with confirmation
- Toast notifications for all operations
- Loading states with spinners

### 4. Filtering
- Real-time filtering with useEffect
- Multiple filter criteria (date range, status, type, etc.)
- Quick search across all fields
- Dynamic dropdowns from data

### 5. UI Components
- DashboardLayout wrapper
- Search/Filter Card
- Data Table with actions
- Add/Edit Dialog with form
- Loading spinners
- Empty states
- Action buttons (Edit, Delete)

## Files to Create

### 1. Admission Query (`src/pages/admin/AdminSection/AdmissionQuery.tsx`)
- **Fields**: name, phone, email, address, source, query_date, next_follow_up_date, status, class, number_of_child, description
- **Filters**: date range, source, status, quick search
- **Status**: Pending, Follow Up, Contacted, Converted, Closed
- **Sources**: Facebook, Website, Google, Referral, Walk-in

### 2. Visitor Book (`src/pages/admin/AdminSection/VisitorBook.tsx`)
- **Fields**: purpose, name, phone, id_number, no_of_person, date, in_time, out_time, file_attachment
- **Layout**: Form on left (1/3), table on right (2/3)
- **Filters**: date range, purpose, quick search
- **Actions**: Add, Edit, Delete, View

### 3. Complaint (`src/pages/admin/AdminSection/Complaint.tsx`)
- **Fields**: complaint_by, complaint_type (user/staff), source, phone, date, actions_taken, assigned, description, status
- **Layout**: Form on left (1/3), table on right (2/3)
- **Filters**: date range, type, source, status, quick search
- **Status**: Open, In Progress, Resolved, Closed

### 4. Postal Receive (`src/pages/admin/AdminSection/PostalReceive.tsx`)
- **Fields**: from_title, reference_no, address, note, to_title, date, file_attachment
- **Layout**: Form on left (1/3), table on right (2/3)
- **Filters**: date range, reference_no, quick search
- **Actions**: Add, Edit, Delete, View attachment

### 5. Postal Dispatch (`src/pages/admin/AdminSection/PostalDispatch.tsx`)
- **Fields**: to_title, reference_no, address, note, from_title, date, file_attachment
- **Layout**: Form on left (1/3), table on right (2/3)
- **Filters**: date range, reference_no, quick search
- **Actions**: Add, Edit, Delete, View attachment

### 6. Phone Call Log (`src/pages/admin/AdminSection/PhoneCallLog.tsx`)
- **Fields**: name, phone, date, description, next_follow_up_date, call_duration, call_type (Incoming/Outgoing)
- **Layout**: Full width with table
- **Filters**: date range, call_type, quick search
- **Actions**: Add, Edit, Delete

### 7. Admin Setup (`src/pages/admin/AdminSection/AdminSetup.tsx`)
- **Fields**: name, type (Academic Year/Session/Term/etc), value, description, is_active
- **Layout**: Full width with table
- **Filters**: type, is_active, quick search
- **Actions**: Add, Edit, Delete, Toggle active

### 8. ID Card (`src/pages/admin/AdminSection/IdCard.tsx`)
- **Purpose**: Generate ID cards for students/staff
- **Features**: 
  - Select entity type (Student/Staff)
  - Select individual or bulk
  - Preview card design
  - Print/Download
- **Integration**: Uses studentApi and teacherApi

### 9. Certificate (`src/pages/admin/AdminSection/Certificate.tsx`)
- **Purpose**: Manage certificate templates
- **Fields**: name, type, template_content, is_active
- **Actions**: Add, Edit, Delete, Preview

### 10. Generate Certificate (`src/pages/admin/AdminSection/GenerateCertificate.tsx`)
- **Purpose**: Generate certificates for students
- **Features**:
  - Select certificate template
  - Select student(s)
  - Fill dynamic fields
  - Preview and download
- **Integration**: Uses certificateApi and studentApi

## Backend Requirements

These endpoints need to be created in Django backend:

```python
# admin_api/views.py
class AdmissionQueryViewSet(viewsets.ModelViewSet):
    queryset = AdmissionQuery.objects.all()
    serializer_class = AdmissionQuerySerializer
    permission_classes = [IsAuthenticated]

# Similar ViewSets for:
- VisitorBookViewSet
- ComplaintViewSet
- PostalReceiveViewSet
- PostalDispatchViewSet
- PhoneCallLogViewSet
- AdminSetupItemViewSet
```

## Current Status

✅ Completed:
- API service layer updated with all interfaces
- API service instances exported
- Students List page (full CRUD)
- Teachers List page (full CRUD with assignments)

🔄 In Progress:
- Creating all Admin Section pages with dynamic data

⏳ Pending:
- Backend models and endpoints for Admin Section
- ID Card generation functionality
- Certificate management
- File upload handling

## Next Steps

1. **Create all Admin Section page components** (10 files)
2. **Test with mock data** (already built into loadData functions)
3. **Create backend models** in Django
4. **Create backend ViewSets and serializers**
5. **Register URL routes** in Django
6. **Test full CRUD operations** end-to-end
7. **Add file upload** for attachments
8. **Implement ID card generation**
9. **Implement certificate generation**

## Usage Notes

- All pages use mock data as fallback when API fails
- Toast notifications for user feedback
- Loading states for better UX
- Confirmation dialogs for destructive actions
- Real-time filtering without API calls
- Mobile-responsive layouts
- Consistent styling with purple theme
