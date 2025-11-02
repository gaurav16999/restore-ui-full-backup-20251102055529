import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Search, Award, BarChart3, Users } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const SimpleGrades = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Students", path: "/admin/students" },
    { icon: BookOpen, label: "Teachers", path: "/admin/teachers" },
    { icon: Award, label: "Grades", active: true, path: "/admin/grades" },
  ];

  const mockStats = {
    total_grades: 74,
    grades_this_week: 12,
    class_average: 85.2,
    top_performers: 15,
    pending_grades: 8
  };

  return (
    <DashboardLayout
      title="Grade Management"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Grade Management</h1>
            <p className="text-muted-foreground mt-1">Manage student grades and assessments</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Grade
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.total_grades}</div>
              <p className="text-xs text-muted-foreground">
                {mockStats.grades_this_week}+ this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Average</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.class_average}%</div>
              <p className="text-xs text-muted-foreground">
                Grade A
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.top_performers}</div>
              <p className="text-xs text-muted-foreground">
                Students with A grade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.pending_grades}</div>
              <p className="text-xs text-muted-foreground">
                Pending grading
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Simple Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grades Overview</CardTitle>
            <CardDescription>View and manage student grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button>Filter</Button>
            </div>

            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Grades table will be displayed here. This simplified version is working!
              </p>
              <Button className="mt-4" onClick={() => toast({ title: "Test", description: "Toast is working!" })}>
                Test Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SimpleGrades;