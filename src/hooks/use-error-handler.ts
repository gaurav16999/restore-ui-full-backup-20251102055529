import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  fallbackData?: any;
  retryCount?: number;
}

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const handleError = useCallback((error: any, options: ErrorHandlerOptions = {}) => {
    const { showToast = true, fallbackData } = options;
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Set the error state
    setError(new Error(errorMessage));

    // Show toast notification if enabled
    if (showToast) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }

    // Return fallback data if provided
    return fallbackData;
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (fn: () => Promise<any>, options: ErrorHandlerOptions = {}) => {
    setIsRetrying(true);
    setError(null);

    try {
      const result = await fn();
      setIsRetrying(false);
      return result;
    } catch (error) {
      setIsRetrying(false);
      return handleError(error, options);
    }
  }, [handleError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry
  };
}

// Fallback data for teacher components
export const teacherFallbackData = {
  dashboard: {
    user: "teacher1",
    stats: [
      { title: 'My Classes', value: '5', color: 'primary' },
      { title: 'Total Students', value: '125', color: 'secondary' },
      { title: 'Pending Grades', value: '8', color: 'accent' },
      { title: 'Subject', value: 'Mathematics', color: 'primary' },
    ],
    today_classes: [
      { subject: 'Mathematics', class: '10A', time: '09:00 AM', room: 'Room 101', students: 30 },
      { subject: 'Mathematics', class: '11B', time: '11:00 AM', room: 'Room 102', students: 28 },
      { subject: 'Mathematics', class: '12C', time: '02:00 PM', room: 'Room 103', students: 25 },
    ],
    pending_tasks: [
      { task: 'Grade Assignments', class: '10A', count: '5 assignments', priority: 'high' },
      { task: 'Grade Assignments', class: '11B', count: '3 assignments', priority: 'medium' },
      { task: 'Update Attendance', class: '12C', count: '2 sessions', priority: 'low' },
    ],
    top_students: [
      { name: 'Alice Johnson', class: '10A', grade: 'A+', average: '95%' },
      { name: 'Bob Smith', class: '11B', grade: 'A', average: '92%' },
      { name: 'Carol Davis', class: '12C', grade: 'A', average: '90%' },
    ],
  },

  classes: [
    { 
      id: 1, 
      name: '10A', 
      subject: 'Mathematics', 
      students: 30, 
      schedule: 'Mon, Wed, Fri - 09:00 AM',
      room: 'Room 101',
      description: 'Basic Mathematics for Grade 10'
    },
    { 
      id: 2, 
      name: '11B', 
      subject: 'Mathematics', 
      students: 28, 
      schedule: 'Tue, Thu - 11:00 AM',
      room: 'Room 102',
      description: 'Advanced Mathematics for Grade 11'
    },
    { 
      id: 3, 
      name: '12C', 
      subject: 'Mathematics', 
      students: 25, 
      schedule: 'Mon, Wed - 02:00 PM',
      room: 'Room 103',
      description: 'Calculus and Statistics for Grade 12'
    },
  ],

  students: [
    {
      id: 1,
      name: 'Alice Johnson',
      class: '10A',
      email: 'alice.johnson@school.edu',
      phone: '+1234567890',
      average_grade: 95,
      attendance: 98,
      status: 'active',
      performance: 'excellent'
    },
    {
      id: 2,
      name: 'Bob Smith',
      class: '11B',
      email: 'bob.smith@school.edu',
      phone: '+1234567891',
      average_grade: 88,
      attendance: 95,
      status: 'active',
      performance: 'good'
    },
    {
      id: 3,
      name: 'Carol Davis',
      class: '12C',
      email: 'carol.davis@school.edu',
      phone: '+1234567892',
      average_grade: 92,
      attendance: 96,
      status: 'active',
      performance: 'excellent'
    },
  ],

  grades: [
    {
      id: 1,
      student_name: 'Alice Johnson',
      class_name: '10A',
      subject: 'Mathematics',
      assignment: 'Algebra Test',
      grade: 95,
      date: '2025-10-15',
      comments: 'Excellent work on complex equations'
    },
    {
      id: 2,
      student_name: 'Bob Smith',
      class_name: '11B',
      subject: 'Mathematics',
      assignment: 'Trigonometry Quiz',
      grade: 88,
      date: '2025-10-14',
      comments: 'Good understanding, needs practice with identities'
    },
  ],

  assignments: [
    {
      id: 1,
      title: 'Quadratic Equations Worksheet',
      class_name: '10A',
      subject: 'Mathematics',
      description: 'Solve various quadratic equations using different methods',
      due_date: '2025-10-20',
      total_points: 100,
      submission_count: 25,
      total_students: 30,
      status: 'active',
      submissions: [
        {
          id: 1,
          student_name: 'Alice Johnson',
          submitted_at: '2025-10-18',
          grade: 85,
          graded: true
        },
        {
          id: 2,
          student_name: 'Bob Smith',
          submitted_at: '2025-10-19',
          grade: null,
          graded: false
        }
      ]
    },
    {
      id: 2,
      title: 'Calculus Integration Problems',
      class_name: '12C',
      subject: 'Mathematics',
      description: 'Practice integration techniques and applications',
      due_date: '2025-10-22',
      total_points: 150,
      submission_count: 20,
      total_students: 25,
      status: 'active',
      submissions: [
        {
          id: 3,
          student_name: 'Charlie Brown',
          submitted_at: '2025-10-20',
          grade: 92,
          graded: true
        }
      ]
    },
  ]
};