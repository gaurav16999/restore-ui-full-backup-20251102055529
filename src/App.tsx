import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { NotificationProvider } from "@/lib/notifications";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/admin/Students";
import AdminTeachers from "./pages/admin/Teachers";
import AdminAssignTeacher from "./pages/admin/AssignTeacher";
import AdminClassSubjects from "./pages/admin/ClassSubjects";
import AdminClasses from "./pages/admin/Classes";
import AdminRooms from "./pages/admin/Rooms";
import AdminGrades from "./pages/admin/Grades";
import SimpleGrades from './pages/admin/SimpleGrades';
import GradesDebug from './pages/admin/GradesDebug';
import GradesSimpleTest from './pages/admin/GradesSimpleTest';
import Grades from './pages/admin/Grades';
import GradesNoDashboard from './pages/admin/GradesNoDashboard';
import GradesWithDashboard from './pages/admin/GradesWithDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import AdminReports from "./pages/admin/Reports";
import TestGrades from "./pages/admin/TestGrades";
import SimpleTest from "./pages/SimpleTest";
import AdminAttendance from "./pages/admin/Attendance";
import AdminFeeManagement from "./pages/admin/FeeManagement";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminSettings from "./pages/admin/Settings";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherStudents from "./pages/teacher/Students";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherMessages from "./pages/teacher/Messages";
import TeacherResources from "./pages/teacher/Resources";
import TeacherSettings from "./pages/teacher/Settings";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourses from "./pages/student/Courses";
import StudentAssignments from "./pages/student/Assignments";
import StudentSchedule from "./pages/student/Schedule";
import StudentGrades from "./pages/student/Grades";
import StudentAttendance from "./pages/student/Attendance";
import StudentMessages from "./pages/student/Messages";
import StudentAchievements from "./pages/student/Achievements";
import StudentSettings from "./pages/student/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test" element={<SimpleTest />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute><AdminTeachers /></ProtectedRoute>} />
            <Route path="/admin/assign-teacher" element={<ProtectedRoute><AdminAssignTeacher /></ProtectedRoute>} />
            <Route path="/admin/class-subjects" element={<ProtectedRoute><AdminClassSubjects /></ProtectedRoute>} />
            <Route path="/admin/classes" element={<ProtectedRoute><AdminClasses /></ProtectedRoute>} />
            <Route path="/admin/rooms" element={<ProtectedRoute><AdminRooms /></ProtectedRoute>} />
                <Route path="/admin/grades" element={<ProtectedRoute><ErrorBoundary><GradesWithDashboard /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/admin/grades-no-dashboard" element={<ProtectedRoute><ErrorBoundary><GradesNoDashboard /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/admin/grades-simple" element={<ProtectedRoute><SimpleGrades /></ProtectedRoute>} />
            <Route path="/admin/grades-full" element={<ProtectedRoute><AdminGrades /></ProtectedRoute>} />
            <Route path="/admin/test-grades" element={<ProtectedRoute><TestGrades /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/fees" element={<ProtectedRoute><AdminFeeManagement /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUserManagement /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/classes" element={<ProtectedRoute><TeacherClasses /></ProtectedRoute>} />
            <Route path="/teacher/students" element={<ProtectedRoute><TeacherStudents /></ProtectedRoute>} />
            <Route path="/teacher/attendance" element={<ProtectedRoute><TeacherAttendance /></ProtectedRoute>} />
            <Route path="/teacher/grades" element={<ProtectedRoute><TeacherGrades /></ProtectedRoute>} />
            <Route path="/teacher/assignments" element={<ProtectedRoute><TeacherAssignments /></ProtectedRoute>} />
            <Route path="/teacher/messages" element={<ProtectedRoute><TeacherMessages /></ProtectedRoute>} />
            <Route path="/teacher/resources" element={<ProtectedRoute><TeacherResources /></ProtectedRoute>} />
            <Route path="/teacher/settings" element={<ProtectedRoute><TeacherSettings /></ProtectedRoute>} />
            <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/assignments" element={<ProtectedRoute><StudentAssignments /></ProtectedRoute>} />
            <Route path="/student/schedule" element={<ProtectedRoute><StudentSchedule /></ProtectedRoute>} />
            <Route path="/student/grades" element={<ProtectedRoute><StudentGrades /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/messages" element={<ProtectedRoute><StudentMessages /></ProtectedRoute>} />
            <Route path="/student/achievements" element={<ProtectedRoute><StudentAchievements /></ProtectedRoute>} />
            <Route path="/student/settings" element={<ProtectedRoute><StudentSettings /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
