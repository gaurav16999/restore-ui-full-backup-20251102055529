import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGrades, getGradeStats, getStudents, getSubjects } from '@/lib/api';

const GradesSimpleTest: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('GradesSimpleTest component rendering');

  useEffect(() => {
    console.log('GradesSimpleTest useEffect running');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting data fetch...');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching grades...');
      const gradesData = await getGrades(token);
      console.log('Grades data:', gradesData);
      setGrades(gradesData);

      console.log('Fetching students...');
      const studentsData = await getStudents(token);
      console.log('Students data:', studentsData);
      setStudents(studentsData);

      console.log('Fetching subjects...');
      const subjectsData = await getSubjects(token);
      console.log('Subjects data:', subjectsData);
      setSubjects(subjectsData);

      console.log('Fetching stats...');
      const statsData = await getGradeStats(token);
      console.log('Stats data:', statsData);
      setStats(statsData);

      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grades - Simple Test Version</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {loading.toString()}</p>
            <p>Error: {error || 'None'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{grades.length}</p>
            <p className="text-sm text-muted-foreground">Total Grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{students.length}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{subjects.length}</p>
            <p className="text-sm text-muted-foreground">Total Subjects</p>
          </CardContent>
        </Card>
      </div>

      {stats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
        </CardHeader>
        <CardContent>
          {grades.slice(0, 5).map((grade, index) => (
            <div key={index} className="border-b py-2">
              <p><strong>Student:</strong> {grade.student_name || 'Unknown'}</p>
              <p><strong>Subject:</strong> {grade.subject_name || 'Unknown'}</p>
              <p><strong>Score:</strong> {grade.score}/{grade.max_score} ({grade.percentage}%)</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesSimpleTest;