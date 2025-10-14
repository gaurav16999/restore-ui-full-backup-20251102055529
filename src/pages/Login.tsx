import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Users, BookOpen, UserCircle } from "lucide-react";
import { postToken, getProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const roles = [
    { id: "admin", title: "Administrator", icon: Users, path: "/admin" },
    { id: "teacher", title: "Teacher", icon: BookOpen, path: "/teacher" },
    { id: "student", title: "Student", icon: UserCircle, path: "/student" },
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tokenData = await postToken(email, password);
      window.localStorage.setItem('accessToken', tokenData.access);
      window.localStorage.setItem('refreshToken', tokenData.refresh);
      const profile = await getProfile(tokenData.access);
      // navigate by role from profile
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      alert(err.message || 'Login failed');
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-light mx-auto">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">EduManage</CardTitle>
            <CardDescription className="text-base mt-2">
              Academic Management System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Choose your role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{role.title}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={!selectedRole}>
              Sign In
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">
                Forgot password?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
