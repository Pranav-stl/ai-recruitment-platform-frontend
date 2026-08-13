import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Wallet,
  Building2,
  Send,
} from "lucide-react";

import { getJob } from "../../api/jobApi";
import { applyForJob } from "../../api/applicationApi";
import { getMyResume } from "../../api/resumeApi";

import { useAuth } from "../../auth/useAuth";

import type { JobResponse } from "../../types/job";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await getJob(Number(id));
        setJob(response.data);
      } catch (error) {
        toast.error("Failed to load job.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    try {
      if (!user) {
        toast.error("Please login.");
        return;
      }

      const resume = await getMyResume();

      await applyForJob({
        userId: user.id,
        jobId: job!.id,
        resumeId: resume.data.id,
      });

      toast.success("Application submitted successfully.");

      navigate("/candidate/applications");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to apply."
      );
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!job) {
    return <p>Job not found.</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <div className="rounded-xl border bg-card p-6">

        <div className="flex justify-between">

          <div className="flex gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-6 w-6" />
            </div>

            <div>

              <h1 className="text-2xl font-bold">
                {job.title}
              </h1>

              <p className="text-muted-foreground">
                {job.company}
              </p>

            </div>

          </div>

          <Button onClick={handleApply}>
            <Send className="mr-2 h-4 w-4" />
            Apply Now
          </Button>

        </div>

        <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">

          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {job.location}
          </span>

          <span className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            {job.experience} Years
          </span>

          <span className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            ₹{job.salary.toLocaleString()}
          </span>

        </div>

      </div>

      <div className="rounded-xl border bg-card p-6">

        <h2 className="text-lg font-semibold">
          Job Description
        </h2>

        <p className="mt-3 whitespace-pre-wrap">
          {job.description}
        </p>

      </div>

      <div className="rounded-xl border bg-card p-6">

        <h2 className="text-lg font-semibold">
          Required Skills
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">

          {job.requiredSkills
            .split(",")
            .map((skill) => (
              <Badge key={skill.trim()}>
                {skill.trim()}
              </Badge>
            ))}

        </div>

      </div>

      <Button
        onClick={handleApply}
        className="w-full"
      >
        <Send className="mr-2 h-4 w-4" />
        Apply Now
      </Button>

    </div>
  );
}