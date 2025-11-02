import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBook, 
  faPlus,
  faSearch,
  faDownload,
  faEye,
  faEdit,
  faTrash,
  faUpload,
  faFolder,
  faFile,
  faVideo,
  faImage,
  faFilePdf,
  faFileWord,
  faShare,
  faBookOpen,
  faGraduationCap
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getTeacherSidebarItems } from "@/lib/teacherSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TeacherResources = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const sidebarItems = getTeacherSidebarItems("/teacher/resources");

  // Mock data for resources
  const resources = [
    {
      id: 1,
      title: "Quadratic Equations Worksheet",
      type: "Document",
      category: "Worksheet",
      subject: "Mathematics",
      description: "Practice problems for quadratic equations with step-by-step solutions",
      fileType: "PDF",
      fileSize: "2.5 MB",
      downloadCount: 45,
      uploadDate: "2024-10-10",
      tags: ["Algebra", "Practice", "Grade 10"],
      sharedWith: "10A, 10B",
      lastAccessed: "2024-10-15"
    },
    {
      id: 2,
      title: "Pendulum Motion Lab Video",
      type: "Video",
      category: "Lab Material",
      subject: "Physics",
      description: "Demonstration of pendulum motion experiment setup and procedure",
      fileType: "MP4",
      fileSize: "15.2 MB",
      downloadCount: 28,
      uploadDate: "2024-10-08",
      tags: ["Lab", "Experiment", "Grade 11"],
      sharedWith: "11B",
      lastAccessed: "2024-10-14"
    },
    {
      id: 3,
      title: "Organic Chemistry Reference Chart",
      type: "Image",
      category: "Reference",
      subject: "Chemistry",
      description: "Comprehensive chart of organic compound structures and naming conventions",
      fileType: "PNG",
      fileSize: "1.8 MB",
      downloadCount: 67,
      uploadDate: "2024-09-25",
      tags: ["Reference", "Organic", "Grade 10"],
      sharedWith: "10B",
      lastAccessed: "2024-10-16"
    },
    {
      id: 4,
      title: "Calculus Integration Techniques",
      type: "Document",
      category: "Study Guide",
      subject: "Advanced Mathematics",
      description: "Complete guide to integration techniques with examples and practice problems",
      fileType: "PDF",
      fileSize: "4.1 MB",
      downloadCount: 32,
      uploadDate: "2024-10-05",
      tags: ["Calculus", "Integration", "Grade 12"],
      sharedWith: "12A",
      lastAccessed: "2024-10-12"
    },
    {
      id: 5,
      title: "Math Formula Quick Reference",
      type: "Document",
      category: "Reference",
      subject: "Mathematics",
      description: "Essential formulas for algebra, geometry, and trigonometry",
      fileType: "PDF",
      fileSize: "0.8 MB",
      downloadCount: 89,
      uploadDate: "2024-09-15",
      tags: ["Reference", "Formulas", "All Grades"],
      sharedWith: "All Classes",
      lastAccessed: "2024-10-16"
    }
  ];

  const recentUploads = resources.slice(0, 3);
  const popularResources = resources.sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 3);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesSubject = selectedSubject === "all" || resource.subject === selectedSubject;
    
    return matchesSearch && matchesCategory && matchesSubject;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf": return faFilePdf;
      case "doc": case "docx": return faFileWord;
      case "mp4": case "avi": case "mov": return faVideo;
      case "png": case "jpg": case "jpeg": return faImage;
      default: return faFile;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf": return "bg-red-100 text-red-800";
      case "doc": case "docx": return "bg-blue-100 text-blue-800";
      case "mp4": case "avi": case "mov": return "bg-purple-100 text-purple-800";
      case "png": case "jpg": case "jpeg": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Worksheet": return "bg-blue-100 text-blue-800";
      case "Lab Material": return "bg-purple-100 text-purple-800";
      case "Reference": return "bg-green-100 text-green-800";
      case "Study Guide": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout
      title="Resources"
      userName="Prof. Michael Anderson"
      userRole="Senior Teacher"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Teaching Resources</h2>
            <p className="text-muted-foreground">Manage and share educational materials with your students</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FontAwesomeIcon icon={faFolder} className="mr-2" />
              Organize
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Upload New Resource</DialogTitle>
                  <DialogDescription>Add a new teaching resource to your library</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" className="col-span-3" placeholder="Resource title" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worksheet">Worksheet</SelectItem>
                        <SelectItem value="lab">Lab Material</SelectItem>
                        <SelectItem value="reference">Reference</SelectItem>
                        <SelectItem value="study-guide">Study Guide</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subject" className="text-right">Subject</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="advanced-math">Advanced Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea id="description" className="col-span-3" placeholder="Brief description of the resource" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right">Tags</Label>
                    <Input id="tags" className="col-span-3" placeholder="Comma-separated tags" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">File</Label>
                    <Input id="file" type="file" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shareWith" className="text-right">Share With</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select classes to share with" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="10a">10A - Mathematics</SelectItem>
                        <SelectItem value="10b">10B - Chemistry</SelectItem>
                        <SelectItem value="11b">11B - Physics</SelectItem>
                        <SelectItem value="12a">12A - Advanced Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                    Upload Resource
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <FontAwesomeIcon icon={faBook} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.length}</div>
              <p className="text-xs text-muted-foreground">In your library</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <FontAwesomeIcon icon={faDownload} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.reduce((sum, r) => sum + r.downloadCount, 0)}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <FontAwesomeIcon icon={faGraduationCap} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(...resources.map(r => r.downloadCount))}</div>
              <p className="text-xs text-muted-foreground">Downloads for top resource</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
              <FontAwesomeIcon icon={faUpload} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all-resources" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-resources">All Resources</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all-resources" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Worksheet">Worksheets</SelectItem>
                  <SelectItem value="Lab Material">Lab Materials</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Study Guide">Study Guides</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Advanced Mathematics">Advanced Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={getFileIcon(resource.fileType)} className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base">{resource.title}</CardTitle>
                          <CardDescription>{resource.subject}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className={getCategoryColor(resource.category)}>
                        {resource.category}
                      </Badge>
                      <Badge variant="outline" className={getFileTypeColor(resource.fileType)}>
                        {resource.fileType}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>File Size:</span>
                        <span>{resource.fileSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Downloads:</span>
                        <span>{resource.downloadCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shared With:</span>
                        <span>{resource.sharedWith}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span>{resource.uploadDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <FontAwesomeIcon icon={faEye} className="mr-1 w-3 h-3" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FontAwesomeIcon icon={faShare} className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUpload} />
                  Recently Uploaded Resources
                </CardTitle>
                <CardDescription>Your latest additions to the resource library</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUploads.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={getFileIcon(resource.fileType)} className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{resource.title}</div>
                              <div className="text-sm text-muted-foreground">{resource.fileSize}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{resource.subject}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getCategoryColor(resource.category)}>
                            {resource.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{resource.uploadDate}</TableCell>
                        <TableCell>{resource.downloadCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  Most Popular Resources
                </CardTitle>
                <CardDescription>Resources with the highest download counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularResources.map((resource, index) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                        <FontAwesomeIcon icon={getFileIcon(resource.fileType)} className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <h4 className="font-semibold">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground">{resource.subject} - {resource.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{resource.downloadCount} downloads</div>
                        <div className="text-sm text-muted-foreground">Shared with {resource.sharedWith}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeacherResources;