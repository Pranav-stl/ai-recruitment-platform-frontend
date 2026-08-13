import { useEffect, useState } from "react";
import { getRecruiterJobs } from "../../api/jobApi";
import {
  getRecruiterApplicationsByJob,
  updateApplicationStatus,
} from "../../api/applicationApi";
import type {
  RecruiterApplicationResponse,
} from "../../types/application";
import type { JobResponse } from "../../types/job";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { downloadResume } from "../../api/resumeApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";

import { Separator } from "../../components/ui/separator";


const statusStyles: Record<string, string> = {
  APPLIED: "bg-blue-500/10 text-blue-600",
  REVIEWED: "bg-amber-500/10 text-amber-600",
  SHORTLISTED: "bg-emerald-500/10 text-emerald-600",
  REJECTED: "bg-red-500/10 text-red-600",
};

export default function ApplicantsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [applications, setApplications] = useState<
    RecruiterApplicationResponse[]
  >([]);
  const [selectedApplication, setSelectedApplication] =
  useState<RecruiterApplicationResponse | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      const { data } = await getRecruiterJobs();

      setJobs(data);

      if (data.length > 0) {
        setSelectedJob(data[0].id);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
  if (!selectedJob) return;

  const loadApplications = async () => {
    const { data } = await getRecruiterApplicationsByJob(selectedJob);
    setApplications(data);
  };

  loadApplications();
}, [selectedJob]);

 const changeStatus = async (
  applicationId: number,
  status: string
) => {
  try {
    await updateApplicationStatus(applicationId, status);

    setApplications((prev) =>
      prev.map((application) =>
        application.applicationId === applicationId
          ? { ...application, status }
          : application
      )
    );
  } catch (error) {
    console.error("Failed to update status", error);
  }
};

const viewResume = async (resumeId: number) => {
  try {
    const response = await downloadResume(resumeId);

    const url = window.URL.createObjectURL(response.data);

    window.open(url, "_blank");
  } catch (error) {
    console.error("Failed to open resume", error);
  }
};
const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Moderate Match";
  return "Weak Match";
};

  return (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Applicants</h1>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Select Job
      </label>

      <select
        className="w-full rounded-lg border p-2"
        value={selectedJob ?? ""}
        onChange={(e) =>
          setSelectedJob(Number(e.target.value))
        }
      >
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.title} - {job.company}
          </option>
        ))}
      </select>
    </div>

    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-full">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left">Candidate</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Match</th>
            <th className="p-3 text-left">Resume</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
            <th className="p-3 text-left">Details</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => (
            <tr key={app.applicationId} className="border-t">
              <td className="p-3">{app.candidateName}</td>
              <td className="p-3">{app.candidateEmail}</td>
              <td className="p-3">{app.matchScore}%</td>

              <td className="p-3">
  <Button
    size="sm"
    variant="outline"
    onClick={() => viewResume(app.resumeId)}
  >
    View Resume
  </Button>
</td>
              <td className="p-3">
  <Badge
    variant="secondary"
    className={statusStyles[app.status]}
  >
    {app.status}
  </Badge>
</td>
         <td className="p-3">
  <div className="flex gap-2">

    <Button
      size="sm"
      variant="outline"
      onClick={() => setSelectedApplication(app)}
    >
      View Details
    </Button>

    <Button
      size="sm"
      disabled={app.status === "REVIEWED"}
      onClick={() =>
        changeStatus(app.applicationId, "REVIEWED")
      }
    >
      Review
    </Button>

    <Button
      size="sm"
      disabled={app.status === "SHORTLISTED"}
      onClick={() =>
        changeStatus(app.applicationId, "SHORTLISTED")
      }
    >
      Shortlist
    </Button>

    <Button
      size="sm"
      variant="destructive"
      disabled={app.status === "REJECTED"}
      onClick={() =>
        changeStatus(app.applicationId, "REJECTED")
      }
    >
      Reject
    </Button>

  </div>
</td>   

              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <Dialog
  open={selectedApplication !== null}
  onOpenChange={() => setSelectedApplication(null)}
>
  <DialogContent className="max-w-5xl">
    <DialogHeader>
      <DialogTitle>
        Candidate AI Analysis
      </DialogTitle>
    </DialogHeader>
    {selectedApplication && (
  <div className="space-y-6">

    <div className="flex items-center justify-between">

      <div>
        <h2 className="text-2xl font-bold">
          {selectedApplication.candidateName}
        </h2>

        <p className="text-muted-foreground">
          {selectedApplication.candidateEmail}
        </p>
      </div>

      <div className="text-right">

        <p className="text-sm text-muted-foreground">
          AI Match Score
        </p>

        <p
          className={`text-4xl font-bold ${getScoreColor(
            selectedApplication.matchScore
          )}`}
        >
          {selectedApplication.matchScore}%
        </p>

      </div>

    </div>

    <Separator />

    <Card>

      <CardHeader>
        <CardTitle>
          AI Recommendation
        </CardTitle>
      </CardHeader>

      <CardContent>

        <Badge>
          {getScoreLabel(selectedApplication.matchScore)}
        </Badge>

        <p className="mt-4 text-muted-foreground">
          {selectedApplication.analysis}
        </p>

      </CardContent>

    </Card>

    <div className="grid grid-cols-2 gap-6">

      <Card>

        <CardHeader>
          <CardTitle>
            Matching Skills
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="flex flex-wrap gap-2">

            {selectedApplication.matchingSkills
              ?.split(",")

              .map((skill) => (
                <Badge
                  key={skill}
                  className="bg-green-100 text-green-700"
                >
                  {skill.trim()}
                </Badge>
              ))}

          </div>

        </CardContent>

      </Card>

      <Card>

        <CardHeader>
          <CardTitle>
            Missing Skills
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="flex flex-wrap gap-2">

            {selectedApplication.missingSkills
              ?.split(",")

              .map((skill) => (
                <Badge
                  key={skill}
                  variant="destructive"
                >
                  {skill.trim()}
                </Badge>
              ))}

          </div>

        </CardContent>

      </Card>

    </div>

    <Separator />

    <div className="flex justify-between">

      <Button
        variant="outline"
        onClick={() =>
          viewResume(selectedApplication.resumeId)
        }
      >
        View Resume
      </Button>

      <div className="flex gap-2">

        <Button
          onClick={() =>
            changeStatus(
              selectedApplication.applicationId,
              "REVIEWED"
            )
          }
        >
          Review
        </Button>

        <Button
          onClick={() =>
            changeStatus(
              selectedApplication.applicationId,
              "SHORTLISTED"
            )
          }
        >
          Shortlist
        </Button>

        <Button
          variant="destructive"
          onClick={() =>
            changeStatus(
              selectedApplication.applicationId,
              "REJECTED"
            )
          }
        >
          Reject
        </Button>

      </div>

    </div>

  </div>
)}

    
    
  </DialogContent>
</Dialog>
  </div>
);
}