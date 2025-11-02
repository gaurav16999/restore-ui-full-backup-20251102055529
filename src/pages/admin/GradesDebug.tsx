import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Student {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface Subject {
  id: number;
  name: string;
}

const GradesDebug: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  console.log('GradesDebug component rendering');

  useEffect(() => {
    console.log('GradesDebug useEffect running');
    fetchStudentsAndSubjects();
  }, []);

  const fetchStudentsAndSubjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching students and subjects...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch students
      const studentsResponse = await fetch('http://localhost:8000/api/admin/students/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        console.log('Students data:', studentsData);
        setStudents(studentsData);
      } else {
        console.error('Failed to fetch students');
      }

      // Fetch subjects
      const subjectsResponse = await fetch('http://localhost:8000/api/admin/subjects/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        console.log('Subjects data:', subjectsData);
        setSubjects(subjectsData);
      } else {
        console.error('Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grades Debug - With Select Components</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Students loaded: {students.length}</p>
          <p>Subjects loaded: {subjects.length}</p>
          <p>Loading: {loading.toString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Select Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Select</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Student</label>
            <Input placeholder="Student name" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Input placeholder="Subject name" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Grade</label>
            <Input type="number" placeholder="Enter grade (0-100)" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comments</label>
            <Textarea placeholder="Add comments about the grade" />
          </div>

          <Button>Add Grade</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>Mathematics</TableCell>
                <TableCell>85</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>Physics</TableCell>
                <TableCell>92</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesDebug;