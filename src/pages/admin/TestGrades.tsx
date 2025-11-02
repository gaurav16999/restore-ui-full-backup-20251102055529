import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart3, Users, BookOpen, FileText } from "lucide-react";

const TestGrades = () => {
  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Students", path: "/admin/students" },
    { icon: BookOpen, label: "Teachers", path: "/admin/teachers" },
    { icon: FileText, label: "Grades", active: true, path: "/admin/grades" },
  ];

  return (
    <DashboardLayout
      title="Test Grades"
      userName="Admin User"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold">Test Grades Page</h1>
        <p>This is a simple test page to verify the layout is working.</p>
      </div>
    </DashboardLayout>
  );
};

export default TestGrades;