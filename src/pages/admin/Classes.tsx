import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, 
  faPlus, 
  faUsers, 
  faChalkboardTeacher, 
  faChartBar, 
  faDollarSign, 
  faUserCog, 
  faClipboardList, 
  faFileText, 
  faCog, 
  faClock, 
  faGraduationCap, 
  faEdit, 
  faTrash,
  faTrophy,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getClasses, getClassesStats, createClass, getTeachers, updateClass, deleteClass, getRooms } from "@/lib/api";
import { convertADtoBS, convertBStoAD, isValidBSDate, isValidADDate } from "@/lib/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isClassEditMode, setIsClassEditMode] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  // Conflict detection states
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [conflictingClasses, setConflictingClasses] = useState<any[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const { toast } = useToast();

  // Conflict detection function
  const checkScheduleConflict = (formData: any) => {
    if (!formData.room || !formData.date || !formData.start_time || !formData.end_time) {
      setConflictWarning(null);
      setConflictingClasses([]);
      setShowConflictWarning(false);
      return;
    }

    const conflicts = classes.filter(cls => {
      // Skip checking against the class being edited
      if (isClassEditMode && editingClassId && cls.id === editingClassId) {
        return false;
      }

      // Check if same room and same date/time
      const sameRoom = cls.room === formData.room;
      const sameDate = cls.date === formData.date;
      const sameDayOfWeek = cls.day_of_week === formData.day_of_week;
      
      if (!sameRoom) return false;
      if (!sameDate && !sameDayOfWeek) return false;

      // Check time overlap
      const formStartTime = new Date(`2000-01-01T${formData.start_time}`);
      const formEndTime = new Date(`2000-01-01T${formData.end_time}`);
      const clsStartTime = new Date(`2000-01-01T${cls.start_time}`);
      const clsEndTime = new Date(`2000-01-01T${cls.end_time}`);

      // Handle cases where end time is before start time (spans midnight or data error)
      // This commonly happens when PM times are stored as AM (e.g., 1:41 PM stored as 01:41 instead of 13:41)
      const formEndTimeAdjusted = formEndTime <= formStartTime ? 
        new Date(formEndTime.getTime() + 24 * 60 * 60 * 1000) : formEndTime;
      const clsEndTimeAdjusted = clsEndTime <= clsStartTime ? 
        new Date(clsEndTime.getTime() + 24 * 60 * 60 * 1000) : clsEndTime;

      // Check if times overlap (using adjusted times)
      return (formStartTime < clsEndTimeAdjusted && formEndTimeAdjusted > clsStartTime);
    });

    if (conflicts.length > 0) {
      setConflictingClasses(conflicts);
      setConflictWarning(
        `⚠️ Schedule conflict detected! ${conflicts.length} class(es) already scheduled in ${formData.room} at this time.`
      );
      setShowConflictWarning(true);
    } else {
      setConflictWarning(null);
      setConflictingClasses([]);
      setShowConflictWarning(false);
    }
  };

  // Check if a class has any scheduling conflicts with other classes
  const hasScheduleConflict = (classItem: any) => {
    if (!classItem.room) {
      return false;
    }

    return classes.some(otherClass => {
      if (otherClass.id === classItem.id) return false;

      const sameRoom = otherClass.room === classItem.room;
      
      if (!sameRoom) return false;

      // Check if we have structured time data for both classes
      if (classItem.start_time && classItem.end_time && otherClass.start_time && otherClass.end_time) {
        // For structured scheduling, check date/day overlap
        const sameDate = otherClass.date === classItem.date;
        const sameDayOfWeek = otherClass.day_of_week === classItem.day_of_week;
        
        // If neither date nor day of week matches, no conflict
        if (!sameDate && !sameDayOfWeek) return false;

        // Check time overlap
        try {
          const classStartTime = new Date(`2000-01-01T${classItem.start_time}`);
          const classEndTime = new Date(`2000-01-01T${classItem.end_time}`);
          const otherStartTime = new Date(`2000-01-01T${otherClass.start_time}`);
          const otherEndTime = new Date(`2000-01-01T${otherClass.end_time}`);

          // Handle cases where end time is before start time (spans midnight or data error)
          // This commonly happens when PM times are stored as AM (e.g., 1:41 PM stored as 01:41 instead of 13:41)
          const classEndTimeAdjusted = classEndTime <= classStartTime ? 
            new Date(classEndTime.getTime() + 24 * 60 * 60 * 1000) : classEndTime;
          const otherEndTimeAdjusted = otherEndTime <= otherStartTime ? 
            new Date(otherEndTime.getTime() + 24 * 60 * 60 * 1000) : otherEndTime;

          return (classStartTime < otherEndTimeAdjusted && classEndTimeAdjusted > otherStartTime);
        } catch (error) {
          console.error('Error parsing time for conflict check:', error);
          return false;
        }
      }

      // Fallback: if classes have the same room and same schedule text, consider it a conflict
      if (classItem.schedule && otherClass.schedule && classItem.schedule.trim() && otherClass.schedule.trim()) {
        return classItem.schedule.trim() === otherClass.schedule.trim();
      }

      // If we don't have enough data to determine conflicts, return false
      return false;
    });
  };
  
  const [classFormData, setClassFormData] = useState({
    name: '',
    room: '',
    schedule: '',
    teacher_id: '',
    date: '',
    start_time: '',
    end_time: '',
    day_of_week: '',
    calendar_type: 'AD' // Default to AD (Gregorian calendar)
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const [classesData, statsData, teachersData, roomsData] = await Promise.all([
        getClasses(),
        getClassesStats(),
        getTeachers(),
        getRooms()
      ]);

      // Handle paginated responses
      const classesArray = Array.isArray(classesData) ? classesData : (classesData?.results || []);
      const teachersArray = Array.isArray(teachersData) ? teachersData : (teachersData?.results || []);
      const roomsArray = Array.isArray(roomsData) ? roomsData : (roomsData?.results || []);

      setClasses(classesArray);
      setStats(statsData || {
        total_classes: 0,
        total_subjects: 0,
        total_teachers: 0,
        total_rooms: 0
      });
      setTeachers(teachersArray);
      setRooms(roomsArray);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
      // Set default empty values
      setClasses([]);
      setTeachers([]);
      setRooms([]);
      setStats({
        total_classes: 0,
        total_subjects: 0,
        total_teachers: 0,
        total_rooms: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data before submission
      if (!classFormData.name || !classFormData.room || !classFormData.teacher_id || 
          !classFormData.date || !classFormData.start_time || !classFormData.end_time) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Validate date format based on calendar type
      if (classFormData.calendar_type === 'BS') {
        if (!isValidBSDate(classFormData.date)) {
          toast({
            title: "Invalid Date",
            description: "Please enter a valid BS date in YYYY-MM-DD format",
            variant: "destructive",
          });
          return;
        }
      } else {
        if (!isValidADDate(classFormData.date)) {
          toast({
            title: "Invalid Date",
            description: "Please enter a valid AD date",
            variant: "destructive",
          });
          return;
        }
      }

      const token = localStorage.getItem('accessToken');
      if (!token) return;

      if (isClassEditMode && editingClassId) {
        await updateClass(token, editingClassId, classFormData);
        toast({
          title: "Success",
          description: "Class updated successfully",
        });
      } else {
        await createClass(token, classFormData);
        toast({
          title: "Success",
          description: "Class created successfully",
        });
      }

      setIsClassDialogOpen(false);
      setIsClassEditMode(false);
      setEditingClassId(null);
      setClassFormData({ name: '', room: '', schedule: '', teacher_id: '', date: '', start_time: '', end_time: '', day_of_week: '', calendar_type: 'AD' });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isClassEditMode ? 'update' : 'create'} class`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClass = (classItem: any) => {
    setIsClassEditMode(true);
    setEditingClassId(classItem.id);
    setClassFormData({
      name: classItem.name || '',
      room: classItem.room || '',
      schedule: classItem.schedule || '',
      teacher_id: classItem.teacher_id?.toString() || '',
      date: classItem.date || '',
      start_time: classItem.start_time || '',
      end_time: classItem.end_time || '',
      day_of_week: classItem.day_of_week || '',
      calendar_type: classItem.calendar_type || 'AD'
    });
    setIsClassDialogOpen(true);
  };

  const handleAddNewClass = () => {
    setIsClassEditMode(false);
    setEditingClassId(null);
    setClassFormData({ name: '', room: '', schedule: '', teacher_id: '', date: '', start_time: '', end_time: '', day_of_week: '', calendar_type: 'AD' });
    setIsClassDialogOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await deleteClass(token, itemToDelete);
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const sidebarItems = getAdminSidebarItems("/admin/classes");

  return (
    <DashboardLayout
      title="Classes"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold mb-2">Class Management</h2>
            <p className="text-muted-foreground text-lg">Manage class schedules and assignments</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all h-12" onClick={handleAddNewClass}>
                  <FontAwesomeIcon icon={faPlus} className="w-5 h-5 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isClassEditMode ? 'Edit Class' : 'Create New Class'}</DialogTitle>
                  <DialogDescription>
                    {isClassEditMode ? 'Update class information' : 'Enter class information'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleClassSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="class_name">Class Name *</Label>
                      <Input
                        id="class_name"
                        placeholder="e.g., Grade 10A"
                        value={classFormData.name}
                        onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room">Room *</Label>
                      <Select 
                        value={classFormData.room} 
                        onValueChange={(value) => {
                          const newFormData = { ...classFormData, room: value };
                          setClassFormData(newFormData);
                          checkScheduleConflict(newFormData);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.room_number || room.name || `Room ${room.id}`}>
                              {room.room_number} - {room.name || `Room ${room.id}`} (Capacity: {room.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calendar_type">Calendar Type</Label>
                        <Select 
                          value={classFormData.calendar_type} 
                          onValueChange={(value) => {
                            let convertedDate = '';
                            let dayOfWeek = '';
                            
                            // Convert existing date to new calendar type
                            if (classFormData.date) {
                              try {
                                if (value === 'BS' && classFormData.calendar_type === 'AD') {
                                  // Converting AD to BS
                                  convertedDate = convertADtoBS(classFormData.date);
                                  if (!convertedDate || !isValidBSDate(convertedDate)) {
                                    toast({
                                      title: "Conversion Error",
                                      description: "Unable to convert AD date to BS format. Please enter date manually.",
                                      variant: "destructive",
                                    });
                                    convertedDate = '';
                                  }
                                } else if (value === 'AD' && classFormData.calendar_type === 'BS') {
                                  // Converting BS to AD
                                  if (!isValidBSDate(classFormData.date)) {
                                    toast({
                                      title: "Invalid BS Date",
                                      description: "Please enter a valid BS date before converting to AD.",
                                      variant: "destructive",
                                    });
                                  } else {
                                    convertedDate = convertBStoAD(classFormData.date);
                                    
                                    // Calculate day of week for AD date
                                    if (convertedDate) {
                                      try {
                                        const date = new Date(convertedDate);
                                        if (!isNaN(date.getTime())) {
                                          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                          dayOfWeek = days[date.getDay()];
                                        }
                                      } catch (error) {
                                        console.error('Error calculating day of week:', error);
                                      }
                                    } else {
                                      toast({
                                        title: "Conversion Error",
                                        description: "Unable to convert BS date to AD format. Please enter date manually.",
                                        variant: "destructive",
                                      });
                                    }
                                  }
                                }
                              } catch (error) {
                                console.error('Date conversion error:', error);
                                toast({
                                  title: "Conversion Error",
                                  description: "An error occurred during date conversion. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }
                            
                            const newFormData = { 
                              ...classFormData, 
                              calendar_type: value, 
                              date: convertedDate || classFormData.date,
                              day_of_week: dayOfWeek || (value === 'AD' ? '' : classFormData.day_of_week)
                            };
                            setClassFormData(newFormData);
                            
                            // Show toast notification about conversion
                            if (convertedDate && convertedDate !== classFormData.date) {
                              toast({
                                title: "Date Converted",
                                description: `Date converted from ${classFormData.date} (${classFormData.calendar_type}) to ${convertedDate} (${value})`,
                                duration: 3000,
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select calendar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AD">AD (Gregorian)</SelectItem>
                            <SelectItem value="BS">BS (Bikram Sambat)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">
                          Date {classFormData.calendar_type === 'BS' ? '(BS Format: YYYY-MM-DD)' : '(AD Format)'}
                        </Label>
                        {classFormData.calendar_type === 'BS' ? (
                          <div className="space-y-1">
                            <Input
                              id="date"
                              type="text"
                              placeholder="e.g., 2081-07-10"
                              value={classFormData.date}
                              className={classFormData.date && !isValidBSDate(classFormData.date) ? 'border-red-500' : ''}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                let dayOfWeek = '';
                                
                                // For BS dates, try to convert to AD to calculate day of week
                                if (selectedDate && classFormData.calendar_type === 'BS') {
                                  // Validate BS date format first
                                  if (isValidBSDate(selectedDate)) {
                                    try {
                                      // Convert to AD to get day of week
                                      const adDate = convertBStoAD(selectedDate);
                                      if (adDate) {
                                        const date = new Date(adDate);
                                        if (!isNaN(date.getTime())) {
                                          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                          dayOfWeek = days[date.getDay()];
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error calculating day for BS date:', error);
                                      // Don't show toast for every keystroke, just log the error
                                    }
                                  }
                                } else if (selectedDate && classFormData.calendar_type === 'AD') {
                                  try {
                                    const date = new Date(selectedDate);
                                    if (!isNaN(date.getTime())) {
                                      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                      dayOfWeek = days[date.getDay()];
                                    }
                                  } catch (error) {
                                    console.error('Error calculating day for AD date:', error);
                                  }
                                }
                                
                                const newFormData = { 
                                  ...classFormData, 
                                  date: selectedDate,
                                  day_of_week: dayOfWeek 
                                };
                                setClassFormData(newFormData);
                                checkScheduleConflict(newFormData);
                              }}
                            />
                            {classFormData.date && !isValidBSDate(classFormData.date) && (
                              <p className="text-xs text-red-500">
                                Invalid date format. Please use YYYY-MM-DD
                              </p>
                            )}
                          </div>
                        ) : (
                          <Input
                            id="date"
                            type="date"
                            value={classFormData.date}
                            className={classFormData.date && !isValidADDate(classFormData.date) ? 'border-red-500' : ''}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              let dayOfWeek = '';
                              
                              // Automatically determine day of week from selected date (AD only)
                              if (selectedDate && isValidADDate(selectedDate)) {
                                try {
                                  const date = new Date(selectedDate);
                                  if (!isNaN(date.getTime())) {
                                    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                    dayOfWeek = days[date.getDay()];
                                  }
                                } catch (error) {
                                  console.error('Error calculating day for AD date:', error);
                                }
                              }
                              
                              const newFormData = { 
                                ...classFormData, 
                                date: selectedDate,
                                day_of_week: dayOfWeek 
                              };
                              setClassFormData(newFormData);
                              checkScheduleConflict(newFormData);
                            }}
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="day_of_week">Day of Week</Label>
                        {classFormData.calendar_type === 'BS' ? (
                          classFormData.day_of_week ? (
                            <Input
                              id="day_of_week"
                              value={classFormData.day_of_week ? classFormData.day_of_week.charAt(0).toUpperCase() + classFormData.day_of_week.slice(1) : ''}
                              placeholder="Calculated from BS date"
                              readOnly
                              className="bg-gray-100 cursor-not-allowed"
                            />
                          ) : (
                            <Select 
                              value={classFormData.day_of_week} 
                              onValueChange={(value) => {
                                const newFormData = { ...classFormData, day_of_week: value };
                                setClassFormData(newFormData);
                                checkScheduleConflict(newFormData);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Enter valid BS date first" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sunday">Sunday</SelectItem>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                <SelectItem value="thursday">Thursday</SelectItem>
                                <SelectItem value="friday">Friday</SelectItem>
                                <SelectItem value="saturday">Saturday</SelectItem>
                              </SelectContent>
                            </Select>
                          )
                        ) : (
                          <Input
                            id="day_of_week"
                            value={classFormData.day_of_week ? classFormData.day_of_week.charAt(0).toUpperCase() + classFormData.day_of_week.slice(1) : ''}
                            placeholder="Select a date first"
                            readOnly
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        )}
                      </div>
                    </div>

                    {/* Date conversion helper */}
                    {classFormData.date && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Date Equivalents:</span>
                          {classFormData.calendar_type === 'AD' ? (
                            <>
                              <br />• AD: {classFormData.date}
                              <br />• BS: {convertADtoBS(classFormData.date)}
                            </>
                          ) : (
                            <>
                              <br />• BS: {classFormData.date}
                              <br />• AD: {convertBStoAD(classFormData.date)}
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time *</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={classFormData.start_time}
                          onChange={(e) => {
                            const newFormData = { ...classFormData, start_time: e.target.value };
                            setClassFormData(newFormData);
                            checkScheduleConflict(newFormData);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time">End Time *</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={classFormData.end_time}
                          onChange={(e) => {
                            const newFormData = { ...classFormData, end_time: e.target.value };
                            setClassFormData(newFormData);
                            checkScheduleConflict(newFormData);
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Conflict Warning Alert */}
                    {showConflictWarning && conflictWarning && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                          <div className="flex items-start gap-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 mt-0.5 text-red-600" />
                            <div>
                              <p className="font-semibold">{conflictWarning}</p>
                              <div className="mt-2 space-y-1">
                                {conflictingClasses.map((conflict, index) => (
                                  <div key={index} className="text-sm bg-red-100 p-2 rounded">
                                    <strong>{conflict.name}</strong> - {conflict.start_time} to {conflict.end_time}
                                    {conflict.teacher_name && ` (Teacher: ${conflict.teacher_name})`}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs mt-2 text-red-600">
                                ⚠️ You can still create this class, but please manage the schedule conflict.
                              </p>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="schedule">Additional Schedule Notes</Label>
                      <Input
                        id="schedule"
                        placeholder="e.g., Every Monday, Recurring weekly"
                        value={classFormData.schedule}
                        onChange={(e) => setClassFormData({ ...classFormData, schedule: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher">Assign Teacher</Label>
                      <Select 
                        value={classFormData.teacher_id} 
                        onValueChange={(value) => setClassFormData({ ...classFormData, teacher_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teacher (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                              {teacher.name} - {teacher.subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsClassDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`${
                        showConflictWarning 
                          ? 'bg-red-600 hover:bg-red-700 border-red-700' 
                          : 'bg-green-600 hover:bg-green-700 border-green-700'
                      } text-white transition-colors`}
                    >
                      {isSubmitting ? (
                        isClassEditMode ? "Updating..." : "Creating..."
                      ) : (
                        <div className="flex items-center gap-2">
                          {showConflictWarning ? (
                            <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                          ) : (
                            <span>✓</span>
                          )}
                          {isClassEditMode ? "Update Class" : "Create Class"}
                          {showConflictWarning && " (With Conflict)"}
                        </div>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
                {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
              <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : (stats?.total_classes || 0)}</div>
              <p className="text-xs text-muted-foreground">Active this semester</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subjects</CardTitle>
              <FontAwesomeIcon icon={faChalkboardTeacher} className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : (stats?.total_subjects || 0)}</div>
              <p className="text-xs text-muted-foreground">Across all grades</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Class Size</CardTitle>
              <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : (stats?.avg_class_size || 0)}</div>
              <p className="text-xs text-muted-foreground">Students per class</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
              <FontAwesomeIcon icon={faCalendarAlt} className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : (stats?.active_sessions || 0)}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "100ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-light rounded-lg">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Active Classes</CardTitle>
                <CardDescription>All classes currently in session</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No classes found</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {classes.map((cls, index) => {
                  const hasConflict = hasScheduleConflict(cls);
                  
                  // Debug info for testing
                  console.log(`Class ${cls.name} (ID: ${cls.id}):`, {
                    room: cls.room,
                    start_time: cls.start_time,
                    end_time: cls.end_time,
                    day_of_week: cls.day_of_week,
                    schedule: cls.schedule,
                    hasConflict
                  });
                  
                  return (
                    <Card 
                      key={cls.id} 
                      className={`shadow-md border-2 hover:shadow-lg transition-all ${
                        hasConflict 
                          ? 'border-red-300 bg-red-50 hover:border-red-400' 
                          : 'border-green-300 bg-green-50 hover:border-green-400 hover:border-primary/30'
                      }`} 
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardHeader className={`${hasConflict ? 'bg-red-100' : 'bg-green-100'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{cls.name}</CardTitle>
                            {hasConflict ? (
                              <span className="flex items-center gap-1 px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-3 h-3" />
                                Conflict
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                                ✓ Clear
                              </span>
                            )}
                          </div>
                          <div className={`px-3 py-1.5 rounded-lg ${hasConflict ? 'bg-red-200' : 'bg-primary-light'}`}>
                            <span className={`text-sm font-bold ${hasConflict ? 'text-red-700' : 'text-primary'}`}>
                              {cls.student_count} students
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Class Teacher:</span>
                          <span className="font-bold">{cls.teacher_name || 'Not Assigned'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Room:</span>
                          <span className={`font-bold ${hasConflict ? 'text-red-600' : ''}`}>{cls.room || 'TBA'}</span>
                        </div>
                        {cls.start_time && cls.end_time ? (
                          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <span className="text-muted-foreground font-medium">Time:</span>
                            <span className={`font-bold ${hasConflict ? 'text-red-600' : 'text-green-600'}`}>
                              {cls.start_time} - {cls.end_time}
                            </span>
                          </div>
                        ) : null}
                        {cls.day_of_week ? (
                          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <span className="text-muted-foreground font-medium">Day:</span>
                            <span className="font-bold capitalize">{cls.day_of_week}</span>
                          </div>
                        ) : null}
                        {cls.date ? (
                          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <span className="text-muted-foreground font-medium">Date:</span>
                            <span className="font-bold">
                              {cls.date} ({cls.calendar_type || 'AD'})
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Schedule Notes:</span>
                          <span className="font-bold">{cls.schedule || 'None'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Subjects:</span>
                          <span className="font-bold">{cls.subject_count} subjects</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-5">
                        <Button variant="outline" size="sm" className="flex-1 border-2 hover:border-primary" onClick={() => handleEditClass(cls)}>
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="border-2 hover:border-destructive hover:bg-destructive-light hover:text-destructive" onClick={() => openDeleteDialog(cls.id)}>
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the class and remove all associated data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminClasses;
