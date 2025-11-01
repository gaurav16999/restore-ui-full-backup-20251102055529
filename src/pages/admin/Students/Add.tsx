import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import authClient from "@/lib/http";

const AddStudent = () => {
  const sidebarItems = getAdminSidebarItems("/admin/students/add");

  // Simple tab state (visual only)
  const [activeTab, setActiveTab] = useState("personal");

  // Academic info
  const [academicYear, setAcademicYear] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");

  // Personal info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  // Contact
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");

  // Medical
  const [bloodGroup, setBloodGroup] = useState("");
  const [category, setCategory] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Parents & Guardian
  const [fatherName, setFatherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [fatherPhoto, setFatherPhoto] = useState<File | null>(null);

  const [motherName, setMotherName] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [motherPhoto, setMotherPhoto] = useState<File | null>(null);

  const [guardianRelation, setGuardianRelation] = useState("Others");
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationOther, setGuardianRelationOther] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianOccupation, setGuardianOccupation] = useState("");
  const [guardianPhoto, setGuardianPhoto] = useState<File | null>(null);
  const [guardianAddress, setGuardianAddress] = useState("");

  // Document info
  const [nationalId, setNationalId] = useState("");
  const [birthCertNumber, setBirthCertNumber] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Bank info
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Document attachments (4)
  const [docTitle1, setDocTitle1] = useState("");
  const [docFile1, setDocFile1] = useState<File | null>(null);
  const [docTitle2, setDocTitle2] = useState("");
  const [docFile2, setDocFile2] = useState<File | null>(null);
  const [docTitle3, setDocTitle3] = useState("");
  const [docFile3, setDocFile3] = useState<File | null>(null);
  const [docTitle4, setDocTitle4] = useState("");
  const [docFile4, setDocFile4] = useState<File | null>(null);

  const handleSave = async () => {
    // Basic validation
    if (!firstName || !lastName || !email || !className) {
      alert("Please fill in required fields: First Name, Last Name, Email, Class");
      return;
    }
    
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: "defaultPassword123", // You may want to generate this or let user specify
        class_name: className,
        class_assigned: className,
        phone: phone,
        date_of_birth: dob || null,
        dob: dob || null,
      };
      
      const response = await authClient.post('/api/admin/students/', payload);
      console.log("Student created", response.data);
      alert("Student created successfully!");
      
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setClassName("");
      setSection("");
      setPhone("");
      setDob("");
      setAdmissionNumber("");
      setAdmissionDate("");
      setCurrentAddress("");
      setPermanentAddress("");
      setBloodGroup("");
      setCategory("");
      setHeight("");
      setWeight("");
      setGender("");
    } catch (error: any) {
      console.error("Failed to create student", error);
      alert("Failed to create student: " + (error.message || "Unknown error"));
    }
  };

  return (
    <DashboardLayout title="Student Admission" userName="Admin" userRole="Administrator" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">Add Student</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-purple-600 border-transparent text-white hover:bg-purple-700">+ IMPORT STUDENT</Button>
            <Button className="bg-purple-600 border-transparent hover:bg-purple-700" onClick={handleSave}>✅ SAVE STUDENT</Button>
          </div>
        </div>

        {/* Tabs (visual) */}
        <div className="flex items-center gap-4 border-b pb-3">
          <button className={`py-2 px-3 rounded ${activeTab === 'personal' ? 'bg-purple-50 text-purple-700' : 'text-muted-foreground'}`} onClick={() => setActiveTab('personal')}>PERSONAL INFO</button>
          <button className={`py-2 px-3 rounded ${activeTab === 'parents' ? 'bg-purple-50 text-purple-700' : 'text-muted-foreground'}`} onClick={() => setActiveTab('parents')}>PARENTS & GUARDIAN INFO</button>
          <button className={`py-2 px-3 rounded ${activeTab === 'document' ? 'bg-purple-50 text-purple-700' : 'text-muted-foreground'}`} onClick={() => setActiveTab('document')}>DOCUMENT INFO</button>
          <button className={`py-2 px-3 rounded ${activeTab === 'previous' ? 'bg-purple-50 text-purple-700' : 'text-muted-foreground'}`} onClick={() => setActiveTab('previous')}>PREVIOUS SCHOOL INFORMATION</button>
          <button className={`py-2 px-3 rounded ${activeTab === 'other' ? 'bg-purple-50 text-purple-700' : 'text-muted-foreground'}`} onClick={() => setActiveTab('other')}>OTHER INFO</button>
          <button className={`py-2 px-3 rounded ${activeTab === 'custom' ? 'bg-purple-50 text-purple-700' : 'text-muted-foreground'}`} onClick={() => setActiveTab('custom')}>CUSTOM FIELD</button>
        </div>

  {/* Main form area: two-column layout */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Academic Year</Label>
                    <Select onValueChange={(v) => setAcademicYear(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="2025|2025" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>2025|2025</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Parents & Guardian Info - shown when parents tab active */}
                  {activeTab === 'parents' && (
                    <div>
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <CardTitle>Parents & Guardian Info</CardTitle>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button variant="outline" className="bg-purple-600 border-transparent text-white hover:bg-purple-700">+ ADD PARENTS</Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left column - Fathers & Mothers info */}
                            <div>
                              <div className="p-4 bg-white border rounded">
                                <h3 className="text-sm font-semibold uppercase border-b pb-3 mb-4 text-muted-foreground">Fathers Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Father Name</Label>
                                    <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="" />
                                  </div>
                                  <div>
                                    <Label>Occupation</Label>
                                    <Input value={fatherOccupation} onChange={(e) => setFatherOccupation(e.target.value)} placeholder="" />
                                  </div>

                                  <div>
                                    <Label>Father Phone</Label>
                                    <Input value={fatherPhone} onChange={(e) => setFatherPhone(e.target.value)} placeholder="" />
                                  </div>
                                  <div>
                                    <Label>Fathers Photo</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Input type="file" onChange={(e) => setFatherPhoto(e.target.files?.[0] ?? null)} />
                                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 bg-white border rounded mt-6">
                                <h3 className="text-sm font-semibold uppercase border-b pb-3 mb-4 text-muted-foreground">Mother Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Mother Name</Label>
                                    <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="" />
                                  </div>
                                  <div>
                                    <Label>Occupation</Label>
                                    <Input value={motherOccupation} onChange={(e) => setMotherOccupation(e.target.value)} placeholder="" />
                                  </div>

                                  <div>
                                    <Label>Mother Phone</Label>
                                    <Input value={motherPhone} onChange={(e) => setMotherPhone(e.target.value)} placeholder="" />
                                  </div>
                                  <div>
                                    <Label>Mothers Photo</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Input type="file" onChange={(e) => setMotherPhoto(e.target.files?.[0] ?? null)} />
                                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right column - Guardian info */}
                            <div>
                              <div className="p-4 bg-white border rounded">
                                <h3 className="text-sm font-semibold uppercase border-b pb-3 mb-4 text-muted-foreground">Guardian Info</h3>

                                <div className="flex items-center gap-4 mb-4">
                                  <div className="flex items-center gap-2">
                                    <input type="radio" id="rel-father" name="guardianRelation" checked={guardianRelation === 'Father'} onChange={() => setGuardianRelation('Father')} />
                                    <label htmlFor="rel-father" className="text-sm">Father</label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input type="radio" id="rel-mother" name="guardianRelation" checked={guardianRelation === 'Mother'} onChange={() => setGuardianRelation('Mother')} />
                                    <label htmlFor="rel-mother" className="text-sm">Mother</label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input type="radio" id="rel-others" name="guardianRelation" checked={guardianRelation === 'Others'} onChange={() => setGuardianRelation('Others')} />
                                    <label htmlFor="rel-others" className="text-sm">Others</label>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Guardians Name</Label>
                                    <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="" />
                                  </div>
                                  <div>
                                    <Label>Relation with Guardian</Label>
                                    <Input value={guardianRelation === 'Others' ? guardianRelationOther : guardianRelation} onChange={(e) => setGuardianRelationOther(e.target.value)} placeholder="Other" />
                                  </div>

                                  <div>
                                    <Label>Guardians Email</Label>
                                    <Input value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} placeholder="" />
                                  </div>
                                  <div>
                                    <Label>Guardian Photo</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Input type="file" onChange={(e) => setGuardianPhoto(e.target.files?.[0] ?? null)} />
                                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Guardians Phone</Label>
                                    <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="" />
                                  </div>
                                  <div>
                                    <Label>Guardian Occupation</Label>
                                    <Input value={guardianOccupation} onChange={(e) => setGuardianOccupation(e.target.value)} placeholder="" />
                                  </div>

                                  <div className="md:col-span-2">
                                    <Label>Guardian Address</Label>
                                    <textarea value={guardianAddress} onChange={(e) => setGuardianAddress(e.target.value)} rows={4} className="w-full mt-2 border rounded p-2" />
                                  </div>

                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  <div>
                    <Label>Class</Label>
                    <Select onValueChange={(v) => setClassName(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Class</SelectItem>
                        <SelectItem value="form-1">Form 1</SelectItem>
                        <SelectItem value="form-2">Form 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Section</Label>
                    <Select onValueChange={(v) => setSection(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Section</SelectItem>
                        <SelectItem value="a">A</SelectItem>
                        <SelectItem value="b">B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Admission Number</Label>
                    <Input value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} placeholder="3" />
                  </div>

                  <div>
                    <Label>Admission Date</Label>
                    <Input value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} placeholder="10/30/2025" />
                  </div>

                  <div>
                    <Label>Roll</Label>
                    <Input placeholder="" />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Group</Label>
                    <Select onValueChange={() => {}}>
                      <SelectTrigger>
                        <SelectValue placeholder="Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="" />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="" />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Student Address Info</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <Input value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)} placeholder="Current Address" />
                      <Input value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} placeholder="Permanent Address" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Personal Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="" />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <Select onValueChange={(v) => setGender(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Gender</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date of Birth</Label>
                    <Input value={dob} onChange={(e) => setDob(e.target.value)} placeholder="10/30/2025" />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Student Photo</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input type="file" />
                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Medical Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Blood Group</Label>
                    <Select onValueChange={(v) => setBloodGroup(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Blood Group</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select onValueChange={(v) => setCategory(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Height (in)</Label>
                    <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="" />
                  </div>

                  <div>
                    <Label>Weight (kg)</Label>
                    <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Info - shown when document tab active */}
        {activeTab === 'document' && (
          <div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Document Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="p-4 bg-white border rounded">
                      <h3 className="text-sm font-semibold uppercase border-b pb-3 mb-4 text-muted-foreground">Document Info</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>National ID Card</Label>
                          <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="" />
                        </div>
                        <div>
                          <Label>Birth Certificate Number</Label>
                          <Input value={birthCertNumber} onChange={(e) => setBirthCertNumber(e.target.value)} placeholder="" />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Additional Notes</Label>
                          <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={4} className="w-full mt-2 border rounded p-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="p-4 bg-white border rounded">
                      <h3 className="text-sm font-semibold uppercase border-b pb-3 mb-4 text-muted-foreground">Bank Information</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label>Bank Name</Label>
                          <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Bank Account Number</Label>
                            <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="" />
                          </div>
                          <div>
                            <Label>IFSC Code</Label>
                            <Input value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} placeholder="" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Document Attachment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Document 01 Title</Label>
                    <Input value={docTitle1} onChange={(e) => setDocTitle1(e.target.value)} placeholder="" />
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-10 text-center bg-gray-50 border rounded py-2">01</div>
                      <Input type="file" onChange={(e) => setDocFile1(e.target.files?.[0] ?? null)} />
                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                    </div>
                  </div>

                  <div>
                    <Label>Document 02 Title</Label>
                    <Input value={docTitle2} onChange={(e) => setDocTitle2(e.target.value)} placeholder="" />
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-10 text-center bg-gray-50 border rounded py-2">01</div>
                      <Input type="file" onChange={(e) => setDocFile2(e.target.files?.[0] ?? null)} />
                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                    </div>
                  </div>

                  <div>
                    <Label>Document 03 Title</Label>
                    <Input value={docTitle3} onChange={(e) => setDocTitle3(e.target.value)} placeholder="" />
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-10 text-center bg-gray-50 border rounded py-2">01</div>
                      <Input type="file" onChange={(e) => setDocFile3(e.target.files?.[0] ?? null)} />
                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                    </div>
                  </div>

                  <div>
                    <Label>Document 04 Title</Label>
                    <Input value={docTitle4} onChange={(e) => setDocTitle4(e.target.value)} placeholder="" />
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-10 text-center bg-gray-50 border rounded py-2">01</div>
                      <Input type="file" onChange={(e) => setDocFile4(e.target.files?.[0] ?? null)} />
                      <Button className="bg-purple-600 border-transparent hover:bg-purple-700">BROWSE</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AddStudent;
