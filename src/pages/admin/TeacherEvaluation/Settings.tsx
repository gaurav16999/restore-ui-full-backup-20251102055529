import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAdminSidebarItems } from "@/lib/adminSidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TeacherEvaluationSettings = () => {
  const sidebarItems = getAdminSidebarItems("/admin/teacher-evaluation/settings");

  const [evaluationEnabled, setEvaluationEnabled] = useState(true);
  const [approvalManual, setApprovalManual] = useState(true);

  const [submittedBy, setSubmittedBy] = useState("student");
  const [submissionTimeAny, setSubmissionTimeAny] = useState(true);

  const handleSaveEvaluation = () => {
    console.log("save evaluation settings", { evaluationEnabled, approvalManual });
  };

  const handleSaveSubmission = () => {
    console.log("save submission settings", { submittedBy, submissionTimeAny });
  };

  return (
    <DashboardLayout
      title="Teacher Evaluation Setting"
      userName="Admin"
      userRole="Administrator"
      sidebarItems={sidebarItems}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Evaluation</div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="evaluation"
                          checked={evaluationEnabled}
                          onChange={() => setEvaluationEnabled(true)}
                        />
                        <span>Enable</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="evaluation"
                          checked={!evaluationEnabled}
                          onChange={() => setEvaluationEnabled(false)}
                        />
                        <span>Disable</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Evaluation Approval</div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="approval"
                          checked={!approvalManual}
                          onChange={() => setApprovalManual(false)}
                        />
                        <span>Auto</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="approval"
                          checked={approvalManual}
                          onChange={() => setApprovalManual(true)}
                        />
                        <span>Manual</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button className="bg-purple-600 border-transparent text-white" onClick={handleSaveEvaluation}>SAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Submitted By</div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="submittedBy"
                          checked={submittedBy === 'student'}
                          onChange={() => setSubmittedBy('student')}
                        />
                        <span>Student</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="submittedBy"
                          checked={submittedBy === 'parent'}
                          onChange={() => setSubmittedBy('parent')}
                        />
                        <span>Parent</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Submission Time</div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="submissionTime"
                          checked={submissionTimeAny}
                          onChange={() => setSubmissionTimeAny(true)}
                        />
                        <span>Any Time</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="submissionTime"
                          checked={!submissionTimeAny}
                          onChange={() => setSubmissionTimeAny(false)}
                        />
                        <span>Fixed Time</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button className="bg-purple-600 border-transparent text-white" onClick={handleSaveSubmission}>SAVE</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherEvaluationSettings;
