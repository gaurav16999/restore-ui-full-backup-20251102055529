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

  const [staffNo, setStaffNo] = useState('1007');
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

  useEffect(() => {
    const load = async () => {
      try {
        const apiModule = await import('@/services/adminApi');
        const desigs = await apiModule.designationApi.getAll();
        const depts = await apiModule.departmentApi.getAll();
        setDesignationOptions(desigs || []);
        setDepartmentOptions(depts || []);
      } catch (err) {
        console.error('load staff dropdowns', err);
      }
    };
    load();
  }, []);

  const handleImport = () => console.log('import staff');
  const handleSave = async () => {
    try {
      const apiModule = await import('@/services/adminApi');
      const saved = await apiModule.employeeApi.create({
        name: `${firstName} ${lastName}`.trim() || firstName || lastName,
        employee_id: staffNo,
        designation: (designation as any) || null,
        department: (department as any) || null,
        phone: mobile,
        email,
        is_active: true,
        join_date: doj || null,
      });
      toast?.({ title: 'Saved', description: 'Employee created' });
      // clear minimal fields
      setFirstName(''); setLastName(''); setEmail(''); setMobile('');
    } catch (err) {
      console.error('save staff', err);
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
                  <label className="text-xs text-muted-foreground block mb-1">STAFF NO *</label>
                  <Input value={staffNo} onChange={(e: any) => setStaffNo(e.target.value)} />
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
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">DESIGNATION</label>
                    <Select value={designation} onValueChange={v => setDesignation(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Designations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
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
