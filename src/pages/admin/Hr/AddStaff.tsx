import { useEffect, useState } from "react";
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const AddStaff = () => {
  const sidebarItems = getAdminSidebarItems("/admin/hr/add-staff");

  const [staffNo, setStaffNo] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [doj, setDoj] = useState('');
  const [mobile, setMobile] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [showAsExpert, setShowAsExpert] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');

  const { toast } = useToast();
  const [designationOptions, setDesignationOptions] = useState<Array<any>>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Don't pre-generate employee ID - it will be assigned on save
        setStaffNo('Auto-generated on save');
        
        // Load designations directly
        const desigResponse = await fetch('http://localhost:8000/api/admin/designations/');
        const desigData = await desigResponse.json();
        const designationList = desigData.results || desigData || [];
        
        // Load departments directly  
        const deptResponse = await fetch('http://localhost:8000/api/admin/departments/');
        const deptData = await deptResponse.json();
        const departmentList = deptData.results || deptData || [];
        
        console.log('✅ Loaded', designationList.length, 'designations:', designationList);
        console.log('✅ Loaded', departmentList.length, 'departments:', departmentList);
        
        setDesignationOptions(designationList);
        setDepartmentOptions(departmentList);
        setLoading(false);
        
        if (designationList.length > 0) {
          toast?.({ title: 'Success', description: `Loaded ${designationList.length} designations` });
        }
      } catch (err) {
        console.error('❌ Error loading staff dropdowns:', err);
        setLoading(false);
        toast?.({ title: 'Error', description: 'Failed to load designations', variant: 'destructive' });
      }
    };
    load();
  }, [toast]);

  const handleImport = () => console.log('import staff');
  const handleSave = async () => {
    try {
      const apiModule = await import('@/services/adminApi');
      const saved = await apiModule.employeeApi.create({
        name: `${firstName} ${lastName}`.trim() || firstName || lastName,
        // Don't send employee_id - let backend auto-generate it
        designation: (designation as any) || null,
        department: (department as any) || null,
        phone: mobile,
        email,
        is_active: true,
        join_date: doj || null,
      });
      
      // Show the assigned ID to user
      const assignedId = saved.employee_id || 'N/A';
      toast?.({ 
        title: '✅ Staff Saved Successfully!', 
        description: `Employee ID assigned: ${assignedId}`,
        duration: 5000
      });
      
      // Update the staffNo field to show the assigned ID
      setStaffNo(assignedId);
      
      console.log('✅ Staff saved with ID:', assignedId);
      
      // clear other fields
      setFirstName(''); 
      setLastName(''); 
      setEmail(''); 
      setMobile('');
      setDesignation('');
      setDepartment('');
    } catch (err) {
      console.error('❌ Error saving staff:', err);
      toast?.({ title: 'Error', description: 'Unable to save staff', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Add New Staff" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" className="bg-purple-600 text-white border-transparent" onClick={handleImport}>IMPORT STAFF</Button>
          <Button className="bg-purple-600 border-transparent text-white" onClick={handleSave}>✅ SAVE STAFF</Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
              <CardTitle>Add New Staff</CardTitle>
              <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
                <button className="px-3 py-1 text-sm rounded border bg-white">BASIC INFO</button>
                <button className="px-3 py-1 text-sm rounded border bg-white">PAYROLL DETAILS</button>
                <button className="px-3 py-1 text-sm rounded border bg-white">BANK INFO DETAILS</button>
                <button className="px-3 py-1 text-sm rounded border bg-white">SOCIAL LINKS DETAILS</button>
                <button className="px-3 py-1 text-sm rounded border bg-white">DOCUMENT INFO</button>
                <button className="px-3 py-1 text-sm rounded border bg-white">CUSTOM FIELD</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">STAFF ID * (Auto-Generated)</label>
                  <Input 
                    value={staffNo} 
                    onChange={(e: any) => setStaffNo(e.target.value)}
                    placeholder="25XXXXXX"
                    className="bg-gray-50 text-lg font-semibold tracking-wide"
                    readOnly
                  />
                  <div className="text-xs text-muted-foreground mt-1">ID format: Year(25) + 6 random digits</div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">FIRST NAME *</label>
                  <Input value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">EMAIL *</label>
                  <Input value={email} onChange={(e: any) => setEmail(e.target.value)} />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">MOBILE *</label>
                  <Input value={mobile} onChange={(e: any) => setMobile(e.target.value)} />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">STAFF PHOTO</label>
                  <div className="flex items-center gap-3">
                    <Input type="file" />
                    <Button className="bg-purple-600 border-transparent text-white">BROWSE</Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">(JPG,JPEG,PNG are allowed for upload)</div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">CURRENT ADDRESS</label>
                  <textarea value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)} className="w-full rounded border p-2 h-24" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">ROLE *</label>
                  <Select value={role} onValueChange={v => setRole(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Role *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">LAST NAME *</label>
                  <Input value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">GENDER *</label>
                  <Select value={gender} onValueChange={v => setGender(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Gender *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">MARITAL STATUS</label>
                  <Select value={maritalStatus} onValueChange={v => setMaritalStatus(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Marital Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">QUALIFICATIONS</label>
                  <textarea value={qualifications} onChange={(e) => setQualifications(e.target.value)} className="w-full rounded border p-2 h-24" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">DEPARTMENT</label>
                    <Select value={department} onValueChange={v => setDepartment(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.length === 0 ? (
                          <SelectItem value="none" disabled>No departments found</SelectItem>
                        ) : (
                          departmentOptions.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      DESIGNATION {!loading && designationOptions.length > 0 && <span className="text-green-600">({designationOptions.length} available)</span>}
                    </label>
                    <Select value={designation} onValueChange={v => setDesignation(v)} disabled={loading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loading ? "Loading designations..." : designationOptions.length > 0 ? "Select Designation" : "No designations - Add in HR → Designation"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : designationOptions.length === 0 ? (
                          <SelectItem value="none" disabled>No designations found - Go to HR → Designation to add</SelectItem>
                        ) : (
                          designationOptions.map((desig: any) => (
                            <SelectItem key={desig.id} value={desig.id.toString()}>
                              {desig.title} ({desig.designation_type})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">FATHER NAME</label>
                    <Input value={fatherName} onChange={(e: any) => setFatherName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">MOTHER NAME</label>
                    <Input value={motherName} onChange={(e: any) => setMotherName(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">DATE OF BIRTH</label>
                    <Input value={dob} onChange={(e: any) => setDob(e.target.value)} placeholder="10/30/2025" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">DATE OF JOINING</label>
                    <Input value={doj} onChange={(e: any) => setDoj(e.target.value)} placeholder="10/30/2025" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">EMERGENCY MOBILE *</label>
                    <Input value={emergencyMobile} onChange={(e: any) => setEmergencyMobile(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">DRIVING LICENSE</label>
                    <Input value={drivingLicense} onChange={(e: any) => setDrivingLicense(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-xs">Show As Expert Staff</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2"><input type="radio" name="expert" checked={showAsExpert} onChange={() => setShowAsExpert(true)} /> Yes</label>
                    <label className="flex items-center gap-2"><input type="radio" name="expert" checked={!showAsExpert} onChange={() => setShowAsExpert(false)} /> No</label>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">PERMANENT ADDRESS</label>
                  <textarea value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} className="w-full rounded border p-2 h-24" />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">EXPERIENCE</label>
                  <textarea value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full rounded border p-2 h-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddStaff;
