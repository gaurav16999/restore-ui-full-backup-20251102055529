import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faSearch, 
  faEdit, 
  faTrash,
  faDoorOpen,
  faBuilding,
  faDesktop,
  faComputer,
  faChalkboard,
  faUsers,
  faFlask,
  faBook,
  faMask,
  faDumbbell
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
import { getRooms, getRoomStats, createRoom, updateRoom, deleteRoom } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";

const AdminRooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [roomFormData, setRoomFormData] = useState({
    room_number: '',
    name: '',
    room_type: 'classroom',
    capacity: 30,
    floor: '',
    building: '',
    has_projector: false,
    has_computer: false,
    has_whiteboard: true
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      const [roomsData, statsData] = await Promise.all([
        getRooms(),
        getRoomStats()
      ]);

      console.log('Rooms API Response:', roomsData);
      console.log('Stats API Response:', statsData);

      // Handle both array and paginated response formats
      const roomsArray = Array.isArray(roomsData) ? roomsData : (roomsData?.results || []);
      
      console.log('Processed rooms array:', roomsArray);
      
      setRooms(roomsArray);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch room data",
        variant: "destructive",
      });
      // Set empty array on error to prevent filter crashes
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      const dataToSubmit = {
        ...roomFormData,
        capacity: Number(roomFormData.capacity)
      };

      if (isEditMode && editingRoomId) {
        await updateRoom(editingRoomId, dataToSubmit);
        toast({
          title: "Success",
          description: "Room updated successfully",
        });
      } else {
        await createRoom(dataToSubmit);
        toast({
          title: "Success",
          description: "Room created successfully",
        });
      }

      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingRoomId(null);
      setRoomFormData({
        room_number: '',
        name: '',
        room_type: 'classroom',
        capacity: 30,
        floor: '',
        building: '',
        has_projector: false,
        has_computer: false,
        has_whiteboard: true
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} room`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRoom = (room: any) => {
    setIsEditMode(true);
    setEditingRoomId(room.id);
    setRoomFormData({
      room_number: room.room_number || '',
      name: room.name || '',
      room_type: room.room_type || 'classroom',
      capacity: room.capacity || 30,
      floor: room.floor || '',
      building: room.building || '',
      has_projector: room.has_projector || false,
      has_computer: room.has_computer || false,
      has_whiteboard: room.has_whiteboard || true
    });
    setIsDialogOpen(true);
  };

  const handleAddNewRoom = () => {
    setIsEditMode(false);
    setEditingRoomId(null);
    setRoomFormData({
      room_number: '',
      name: '',
      room_type: 'classroom',
      capacity: 30,
      floor: '',
      building: '',
      has_projector: false,
      has_computer: false,
      has_whiteboard: true
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (roomId: number) => {
    setRoomToDelete(roomId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      await deleteRoom(roomToDelete);
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  const filteredRooms = (Array.isArray(rooms) ? rooms : []).filter(room => 
    room.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'laboratory': return faFlask;
      case 'library': return faBook;
      case 'auditorium': return faMask;
      case 'gymnasium': return faDumbbell;
      case 'office': return faBuilding;
      default: return faDoorOpen;
    }
  };

  const getRoomTypeBadge = (type: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants = {
      'classroom': 'default' as const,
      'laboratory': 'secondary' as const,
      'library': 'outline' as const,
      'auditorium': 'destructive' as const,
      'gymnasium': 'default' as const,
      'office': 'secondary' as const
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  const sidebarItems = getAdminSidebarItems("/admin/rooms");

  return (
    <DashboardLayout
      title="Room Management"
      userName="Dr. Sarah Johnson"
      userRole="School Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Room Management</h2>
            <p className="text-muted-foreground text-lg">Manage facility rooms and their configurations</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search rooms..."
                className="pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all h-12" onClick={handleAddNewRoom}>
                  <FontAwesomeIcon icon={faPlus} className="w-5 h-5 mr-2" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Update room information' : 'Enter room details'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRoomSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="room_number">Room Number *</Label>
                        <Input
                          id="room_number"
                          placeholder="e.g., 201"
                          value={roomFormData.room_number}
                          onChange={(e) => setRoomFormData({ ...roomFormData, room_number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="room_type">Room Type</Label>
                        <Select 
                          value={roomFormData.room_type} 
                          onValueChange={(value) => setRoomFormData({ ...roomFormData, room_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classroom">Classroom</SelectItem>
                            <SelectItem value="laboratory">Laboratory</SelectItem>
                            <SelectItem value="library">Library</SelectItem>
                            <SelectItem value="auditorium">Auditorium</SelectItem>
                            <SelectItem value="gymnasium">Gymnasium</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Room Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Math Lab, Science Room"
                        value={roomFormData.name}
                        onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          min="1"
                          value={roomFormData.capacity}
                          onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) || 30 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floor">Floor</Label>
                        <Input
                          id="floor"
                          placeholder="e.g., 2nd, Ground"
                          value={roomFormData.floor}
                          onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="building">Building</Label>
                      <Input
                        id="building"
                        placeholder="e.g., Main Building, Science Block"
                        value={roomFormData.building}
                        onChange={(e) => setRoomFormData({ ...roomFormData, building: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Facilities</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_projector"
                            checked={roomFormData.has_projector}
                            onChange={(e) => setRoomFormData({ ...roomFormData, has_projector: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="has_projector" className="text-sm font-normal">
                            <FontAwesomeIcon icon={faDesktop} className="w-4 h-4 mr-2" />
                            Projector
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_computer"
                            checked={roomFormData.has_computer}
                            onChange={(e) => setRoomFormData({ ...roomFormData, has_computer: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="has_computer" className="text-sm font-normal">
                            <FontAwesomeIcon icon={faComputer} className="w-4 h-4 mr-2" />
                            Computer
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_whiteboard"
                            checked={roomFormData.has_whiteboard}
                            onChange={(e) => setRoomFormData({ ...roomFormData, has_whiteboard: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="has_whiteboard" className="text-sm font-normal">
                            <FontAwesomeIcon icon={faChalkboard} className="w-4 h-4 mr-2" />
                            Whiteboard
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Room" : "Create Room")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
              <FontAwesomeIcon icon={faDoorOpen} className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : stats?.total_rooms || 0}</div>
              <p className="text-xs text-muted-foreground">Active facilities</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classrooms</CardTitle>
              <FontAwesomeIcon icon={faChalkboard} className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : stats?.classrooms || 0}</div>
              <p className="text-xs text-muted-foreground">Regular classrooms</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
              <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : stats?.total_capacity || 0}</div>
              <p className="text-xs text-muted-foreground">Students capacity</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Capacity</CardTitle>
              <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{loading ? '...' : stats?.avg_capacity || 0}</div>
              <p className="text-xs text-muted-foreground">Per room</p>
            </CardContent>
          </Card>
        </div>

        {/* Rooms List */}
        <Card className="animate-fade-in shadow-xl border-2" style={{ animationDelay: "100ms" }}>
          <CardHeader className="bg-gradient-card border-b">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faDoorOpen} className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">All Rooms</CardTitle>
                <CardDescription>Manage facility rooms and configurations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading rooms...</div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? `No rooms found matching "${searchTerm}"` : "No rooms found"}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRooms.map((room, index) => (
                  <Card key={room.id} className="shadow-md border-2 hover:shadow-lg hover:border-primary/30 transition-all" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardHeader className="bg-gradient-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={getRoomTypeIcon(room.room_type)} className="w-5 h-5 text-primary" />
                          <CardTitle className="text-lg">{room.room_number}</CardTitle>
                        </div>
                        <Badge variant={getRoomTypeBadge(room.room_type)}>
                          {room.room_type}
                        </Badge>
                      </div>
                      {room.name && (
                        <p className="text-sm text-muted-foreground">{room.name}</p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Capacity:</span>
                          <span className="font-bold">{room.capacity} students</span>
                        </div>
                        {room.floor && (
                          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <span className="text-muted-foreground font-medium">Floor:</span>
                            <span className="font-bold">{room.floor}</span>
                          </div>
                        )}
                        {room.building && (
                          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <span className="text-muted-foreground font-medium">Building:</span>
                            <span className="font-bold">{room.building}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground font-medium">Facilities:</span>
                          <div className="flex gap-2">
                            {room.has_projector && (
                              <FontAwesomeIcon icon={faDesktop} className="w-4 h-4 text-green-600" title="Projector" />
                            )}
                            {room.has_computer && (
                              <FontAwesomeIcon icon={faComputer} className="w-4 h-4 text-blue-600" title="Computer" />
                            )}
                            {room.has_whiteboard && (
                              <FontAwesomeIcon icon={faChalkboard} className="w-4 h-4 text-gray-600" title="Whiteboard" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-5">
                        <Button variant="outline" size="sm" className="flex-1 border-2 hover:border-primary" onClick={() => handleEditRoom(room)}>
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="border-2 hover:border-destructive hover:bg-destructive-light hover:text-destructive" onClick={() => openDeleteDialog(room.id)}>
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminRooms;