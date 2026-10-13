import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Wallet,
  Building2,
  Send,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  CircleAlert,
  FileText,
  ListChecks,
  Info,
} from "lucide-react";

import { getJob } from "../../api/jobApi";
import { applyForJob } from "../../api/applicationApi";
import { getMyResume } from "../../api/resumeApi";

import { useAuth } from "../../auth/useAuth";

import type { JobResponse } from "../../types/job";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

/* ---------- Optional AI data helpers (render only if API provides it) ---------- */

function getMatchScore(job: JobResponse): number | null {
  const record = job as unknown as Record<string, unknown>;
  const raw = record.matchScore ?? record.matchPercentage;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function getStringList(job: JobResponse, key: string): string[] {
  const record = job as unknown as Record<string, unknown>;
  const raw = record[key];
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string");
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getStatus(job: JobResponse): string | null {
  const record = job as unknown as Record<string, unknown>;
  const raw = record.status;
  return typeof raw === "string" && raw.trim() !== "" ? raw : null;
}

function matchStrokeClass(score: number) {
  if (score >= 85) return "stroke-primary";
  if (score >= 70) return "stroke-amber-500";
  return "stroke-muted-foreground";
}

function matchBarClass(score: number) {
  if (score >= 85) return "bg-primary";
  if (score >= 70) return "bg-amber-500";
  return "bg-muted-foreground";
}

function MatchRing({ score }: { score: number }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="64" height="64" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3"
          className="stroke-muted"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={matchStrokeClass(score)}
        />
      </svg>
      <span className="absolute text-sm font-semibold tabular-nums">
        {score}%
      </span>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function JobDetailsSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
      <Skeleton className="h-5 w-40" />

      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <div className="space-y-2.5">
              <Skeleton className="h-6 w-64 max-w-full" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <div className="space-y-3 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-3 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <Skeleton className="h-5 w-36" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

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
    return <JobDetailsSkeleton />;
  }

  if (!job) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-dashed border-border/70 shadow-none">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
              <CircleAlert className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Job not found</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              This job may have been removed or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const skills = job.requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const initial = (job.company || "").trim().charAt(0).toUpperCase() || "?";
  const status = getStatus(job);
  const score = getMatchScore(job);
  const matchedSkills = getStringList(job, "matchedSkills");
  const missingSkills = getStringList(job, "missingSkills");
  const hasAiSection =
    score !== null || matchedSkills.length > 0 || missingSkills.length > 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
      {/* Breadcrumb / back */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Button>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="max-w-[40ch] truncate">{job.company}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <span className="max-w-[40ch] truncate font-medium text-foreground">
          {job.title}
        </span>
      </div>

      {/* Main header */}
      <Card className="gap-0 border-border/60 py-0 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-xl font-semibold text-primary">
                {initial}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                    {job.title}
                  </h1>
                  {status && (
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-emerald-500/20 bg-emerald-500/5 capitalize text-emerald-600"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {status.toLowerCase()}
                    </Badge>
                  )}
                </div>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.company}
                </p>
              </div>
            </div>

            <Button
              onClick={handleApply}
              className="w-full shrink-0 gap-2 sm:w-auto"
            >
              <Send className="h-4 w-4" />
              Apply Now
            </Button>
          </div>

          <Separator className="my-5" />

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>

            <span className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {job.experience} {job.experience === 1 ? "Year" : "Years"}
            </span>

            <span className="inline-flex items-center gap-2 font-medium text-foreground">
              <Wallet className="h-4 w-4 text-muted-foreground" />₹
              {job.salary.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Body */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* AI match (only when the API provides it) */}
          {hasAiSection && (
            <Card className="gap-0 border-primary/20 bg-primary/[0.02] py-0 shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <SectionHeading
                    icon={<Sparkles className="h-4 w-4 text-primary" />}
                    title="AI match"
                  />
                  <Badge
                    variant="outline"
                    className="gap-1 border-primary/20 bg-primary/5 text-[10px] font-medium text-primary"
                  >
                    <Sparkles className="h-3 w-3" />
                    AI
                  </Badge>
                </div>

                {score !== null && (
                  <div className="mt-4 flex items-center gap-4">
                    <MatchRing score={score} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {score}% match with your profile
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            matchBarClass(score)
                          )}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(matchedSkills.length > 0 || missingSkills.length > 0) && (
                  <div
                    className={cn(
                      "grid gap-4 sm:grid-cols-2",
                      score !== null && "mt-5"
                    )}
                  >
                    {matchedSkills.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Matching skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="border-emerald-500/20 bg-emerald-500/5 font-normal text-emerald-700"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {missingSkills.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CircleAlert className="h-3.5 w-3.5 text-amber-600" />
                          Skills to build
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {missingSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="border-amber-500/20 bg-amber-500/5 font-normal text-amber-700"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card className="gap-0 border-border/60 py-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <SectionHeading
                icon={<FileText className="h-4 w-4" />}
                title="Job description"
              />

              <Separator className="my-4" />

              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90 sm:text-[15px]">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
          {skills.length > 0 && (
            <Card className="gap-0 border-border/60 py-0 shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <SectionHeading
                    icon={<ListChecks className="h-4 w-4" />}
                    title="Required skills"
                  />
                  <span className="text-xs text-muted-foreground">
                    {skills.length} {skills.length === 1 ? "skill" : "skills"}
                  </span>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-2.5 py-1 font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
          <Card className="gap-0 border-border/60 py-0 shadow-sm">
            <CardContent className="p-5">
              <SectionHeading
                icon={<Info className="h-4 w-4" />}
                title="Job overview"
              />

              <Separator className="my-4" />

              <div className="flex flex-col gap-4">
                <InfoRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Company"
                  value={job.company}
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value={job.location}
                />
                <InfoRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Experience"
                  value={`${job.experience} ${
                    job.experience === 1 ? "year" : "years"
                  }`}
                />
                <InfoRow
                  icon={<Wallet className="h-4 w-4" />}
                  label="Salary"
                  value={`₹${job.salary.toLocaleString()}`}
                />
                {status && (
                  <InfoRow
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Status"
                    value={<span className="capitalize">{status.toLowerCase()}</span>}
                  />
                )}
              </div>

              <Separator className="my-5" />

              <Button onClick={handleApply} className="w-full gap-2">
                <Send className="h-4 w-4" />
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}