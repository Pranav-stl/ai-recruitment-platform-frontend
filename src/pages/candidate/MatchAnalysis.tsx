import {
  Sparkles,
  CheckCircle2,
  XCircle,
  GraduationCap,
  FileText,
  Briefcase,
  ExternalLink,
  Star,
  GitFork,
  FolderGit2,
  Building2,
  Target,
  Layers,
  CircleAlert,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";

import api from "../../api/axios";
import {
  getApplicationsByUser,
  matchApplication,
} from "../../api/applicationApi";

import type { JobMatchResponse } from "../../types/application";


// ============================================================
// GitHub Evidence Types
// ============================================================

interface GitHubRepository {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  htmlUrl: string;
  stars: number;
  forks: number;
}

interface GitHubEvidence {
  jobId: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  relevantRepositories: GitHubRepository[];
}

interface GitHubScoreResponse {
  github_evidence: {
    status: "COMPLETED" | "NO_EVIDENCE" | "EVALUATION_FAILED";
    score: number | null;
    matched_skills: string[];
    missing_skills: string[];
  };
  combined_score: {
    strategy: string;
    resume_job_score: number;
    github_score: number | null;
    combined_score: number | null;
    github_status: string;
  };
}


// ============================================================
// Helpers
// ============================================================

const matchTextColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

// Same thresholds as matchTextColor, expressed as SVG stroke / bar colors
const matchStrokeColor = (score: number) => {
  if (score >= 80) return "stroke-green-600";
  if (score >= 60) return "stroke-yellow-600";
  return "stroke-red-600";
};

const matchBarColor = (score: number) => {
  if (score >= 80) return "bg-green-600";
  if (score >= 60) return "bg-yellow-600";
  return "bg-red-600";
};

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 shrink-0 items-center justify-center sm:h-44 sm:w-44">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="9"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            matchStrokeColor(score)
          )}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          AI Match
        </span>
        <span
          className={cn(
            "text-4xl font-bold tabular-nums leading-none sm:text-5xl",
            matchTextColor(score)
          )}
        >
          {Math.round(score)}%
        </span>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  aside,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {aside}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold tabular-nums leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function MatchAnalysisSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
          <Skeleton className="h-44 w-44 shrink-0 rounded-full" />
          <div className="grid w-full flex-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm"
          >
            <Skeleton className="h-5 w-40" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}


// ============================================================
// Component
// ============================================================

const MatchAnalysis = () => {
  const { applicationId } = useParams();

  const [data, setData] = useState<JobMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GitHub Evidence state
  const [evidence, setEvidence] = useState<GitHubEvidence | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");

  const [finalScore, setFinalScore] =
  useState<GitHubScoreResponse | null>(null);

const [finalScoreLoading, setFinalScoreLoading] =
  useState(false);

const [finalScoreError, setFinalScoreError] =
  useState("");

  // Display-only: job title / company from the existing applications response
  const [jobContext, setJobContext] = useState<{
    jobTitle?: string;
    company?: string;
  } | null>(null);


  // ==========================================================
  // Load AI Match Analysis
  // ==========================================================

  useEffect(() => {
    const loadMatchAnalysis = async () => {
      if (!applicationId) {
        setError("Application ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await matchApplication(
          Number(applicationId)
        );

        setData(response.data);
      } catch (err) {
        console.error("Failed to load match analysis:", err);
        setError("Unable to load match analysis.");
      } finally {
        setLoading(false);
      }
    };

    loadMatchAnalysis();
  }, [applicationId]);


  // ==========================================================
  // Load GitHub Evidence
  // ==========================================================

  useEffect(() => {
    const loadGitHubEvidence = async () => {
      if (!applicationId) {
        return;
      }

      try {
        setEvidenceLoading(true);
        setEvidenceError("");

        // Get candidate applications
        const applicationsResponse =
          await getApplicationsByUser();

        // Find the current application
        const application =
          applicationsResponse.data.find(
            (app) => app.id === Number(applicationId)
          );

        if (!application) {
          throw new Error("Application not found");
        }

        setJobContext({
          jobTitle: application.jobTitle,
          company: application.company,
        });

        console.log(
          "GitHub Evidence - Application:",
          application
        );

        console.log(
          "GitHub Evidence - Job ID:",
          application.jobId
        );

        // Get GitHub evidence for this job
        const evidenceResponse =
          await api.get<GitHubEvidence>(
            `/api/github/evidence/${application.jobId}`
          );

        console.log(
          "GitHub Evidence Response:",
          evidenceResponse.data
        );

        setEvidence(evidenceResponse.data);
      } catch (err: any) {
        console.error("GITHUB EVIDENCE ERROR:", err);
        console.error("STATUS:", err?.response?.status);
        console.error("DATA:", err?.response?.data);
        console.error("MESSAGE:", err?.message);

        setEvidenceError(
          err?.response?.data?.message ||
            `GitHub evidence request failed (${err?.response?.status || "unknown error"})`
        );
      }
    };

    loadGitHubEvidence();
  }, [applicationId]);

  // ============================================================
// Calculate Final Score (80:20)
// ============================================================

useEffect(() => {
  if (!applicationId || !data) return;

  let cancelled = false;

  const calculateFinalScore = async () => {
    try {
      setFinalScoreLoading(true);
      setFinalScoreError("");

      const response = await api.post<GitHubScoreResponse>(
        `/api/applications/${applicationId}/final-score`
      );

      if (!cancelled) {
        setFinalScore(response.data);
      }
    } catch (err: any) {
      console.error("Final score calculation failed:", err);

      if (!cancelled) {
        setFinalScoreError(
          err?.response?.data?.message ||
            "Unable to calculate the final match score."
        );
      }
    } finally {
      if (!cancelled) {
        setFinalScoreLoading(false);
      }
    }
  };

  calculateFinalScore();

  return () => {
    cancelled = true;
  };
}, [applicationId, data]);


  // ==========================================================
  // Loading
  // ==========================================================

  if (loading) {
    return <MatchAnalysisSkeleton />;
  }


  // ==========================================================
  // Error
  // ==========================================================

  if (error || !data) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
        <Card className="border-dashed border-border/70 shadow-none">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
              <CircleAlert className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              Match analysis unavailable
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-red-500">
              {error || "Match analysis not available."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const matchingCount = data.matchingSkills?.length ?? 0;
  const missingCount = data.missingSkills?.length ?? 0;
  const displayedScore =
  finalScore?.combined_score?.combined_score ?? data.matchScore;

  // ==========================================================
  // Main UI
  // ==========================================================

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">

      {/* ======================================================
          Header
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered analysis
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            AI Match Analysis
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
            AI-powered analysis of your resume against this job.
          </p>
        </div>

        {(jobContext?.jobTitle || jobContext?.company) && (
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-2.5 shadow-sm md:w-fit">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
              {(jobContext.company || jobContext.jobTitle || "?")
                .trim()
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              {jobContext.jobTitle && (
                <p className="truncate text-sm font-semibold leading-tight">
                  {jobContext.jobTitle}
                </p>
              )}
              {jobContext.company && (
                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0" />
                  {jobContext.company}
                </p>
              )}
            </div>
          </div>
        )}
      </div>


      {/* ======================================================
          Hero: Match Score + Summary
      ====================================================== */}

      <Card className="gap-0 overflow-hidden border-border/60 py-0 shadow-sm">
        <CardContent className="p-5 sm:p-8">
          <div className="flex flex-col items-center gap-8 md:flex-row md:gap-10">
            <ScoreRing score={displayedScore} />

            <div className="w-full min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold tracking-tight">
                  AI Match Score
                </h2>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
  {finalScore?.combined_score?.combined_score != null
    ? "Final combined match score"
    : "Resume-job match score"}
  : {Math.round(displayedScore)}% match with the role
</p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
  className={cn(
    "h-full rounded-full transition-[width] duration-700 ease-out",
    matchBarColor(displayedScore)
  )}
  style={{
    width: `${Math.max(0, Math.min(100, displayedScore))}%`,
  }}
/>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <StatTile
                  icon={<Target className="h-4 w-4" />}
                  label="Overall score"
                 value={`${Math.round(displayedScore)}%`}
                />
                <StatTile
                  icon={
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  }
                  label="Matching skills"
                  value={matchingCount}
                />
                <StatTile
                  icon={<XCircle className="h-4 w-4 text-red-600" />}
                  label="Missing skills"
                  value={missingCount}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


{/* ======================================================
    Score Breakdown — 80:20 Resume + GitHub
====================================================== */}

<Card className="border-border/60 shadow-sm">
  <CardContent className="p-5 sm:p-6">
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">
          Score Breakdown
        </h2>
        <Badge variant="secondary">80:20</Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Resume-job matching contributes 80%; GitHub evidence
        contributes 20%.
      </p>
    </div>

    {finalScoreLoading ? (
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    ) : finalScore?.combined_score?.combined_score != null ? (
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatTile
          icon={<Sparkles className="h-4 w-4" />}
          label="Resume-job score (80%)"
          value={`${finalScore.combined_score.resume_job_score}%`}
        />

        <StatTile
          icon={<GitFork className="h-4 w-4" />}
          label="GitHub evidence score (20%)"
          value={
            finalScore.combined_score.github_score != null
              ? `${finalScore.combined_score.github_score}%`
              : "Unavailable"
          }
        />

        <StatTile
          icon={<Target className="h-4 w-4" />}
          label="Scoring strategy"
          value="80:20"
        />
      </div>
    ) : (
      <p className="mt-4 text-sm text-muted-foreground">
        {finalScoreError ||
          "Final score unavailable. Showing the resume-job score above."}
      </p>
    )}
  </CardContent>
</Card>

      {/* ======================================================
          Matching + Missing Skills
      ====================================================== */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* Matching Skills */}

        <Card className="gap-0 border-border/60 py-0 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <SectionHeader
              icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
              title="Matching Skills"
              description="Skills from your resume that fit this role"
              aside={
                <span className="text-xs tabular-nums text-muted-foreground">
                  {matchingCount}
                </span>
              }
            />

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-2">
              {data.matchingSkills?.length > 0 ? (
                data.matchingSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-green-600/20 bg-green-600/5 px-2.5 py-1 font-normal text-green-700"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No matching skills found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Missing Skills */}

        <Card className="gap-0 border-border/60 py-0 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <SectionHeader
              icon={<XCircle className="h-4 w-4 text-red-600" />}
              title="Skills to Develop"
              description="Required skills not found in your resume"
              aside={
                <span className="text-xs tabular-nums text-muted-foreground">
                  {missingCount}
                </span>
              }
            />

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-2">
              {data.missingSkills?.length > 0 ? (
                data.missingSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-dashed px-2.5 py-1 font-normal text-muted-foreground"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No missing skills identified.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>


      {/* ======================================================
          AI Evaluation
      ====================================================== */}

      <Card className="gap-0 border-primary/20 bg-primary/[0.02] py-0 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <SectionHeader
            icon={<Sparkles className="h-4 w-4 text-primary" />}
            title="AI Evaluation"
            description="Overall assessment of your fit for this role"
          />

          <Separator className="my-4" />

          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90 sm:text-[15px]">
            {data.analysis}
          </p>
        </CardContent>
      </Card>


      {/* ======================================================
          Resume + Job Summary
      ====================================================== */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* Resume Summary */}

        <Card className="gap-0 border-border/60 py-0 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <SectionHeader
              icon={<FileText className="h-4 w-4" />}
              title="Resume Summary"
            />

            <Separator className="my-4" />

            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {data.resumeSummary}
            </p>
          </CardContent>
        </Card>


        {/* Job Summary */}

        <Card className="gap-0 border-border/60 py-0 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <SectionHeader
              icon={<Briefcase className="h-4 w-4" />}
              title="Job Summary"
            />

            <Separator className="my-4" />

            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {data.jobSummary}
            </p>
          </CardContent>
        </Card>

      </div>


      {/* ======================================================
          Recommended Courses
      ====================================================== */}

      <Card className="gap-0 border-border/60 py-0 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <SectionHeader
            icon={<GraduationCap className="h-4 w-4" />}
            title="Recommended Learning"
            description="Courses suggested to close your skill gaps"
            aside={
              data.recommendedCourses?.length > 0 ? (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {data.recommendedCourses.length}{" "}
                  {data.recommendedCourses.length === 1
                    ? "course"
                    : "courses"}
                </span>
              ) : undefined
            }
          />

          <Separator className="my-4" />

          {data.recommendedCourses?.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {data.recommendedCourses.map((course, index) => (
                <div
                  key={`${course.skill}-${index}`}
                  className="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <GraduationCap className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold leading-snug">
                        {course.course}
                      </h3>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {course.provider}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="shrink-0 font-normal"
                    >
                      {course.skill}
                    </Badge>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {course.reason}
                  </p>

                  {course.url && (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-fit"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Course
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No course recommendations available.
            </p>
          )}
        </CardContent>
      </Card>


      {/* ======================================================
          GitHub Evidence
      ====================================================== */}

      <Card className="gap-0 border-border/60 py-0 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <SectionHeader
            icon={<FolderGit2 className="h-4 w-4" />}
            title="GitHub Evidence"
            description="Projects that support your skills for this role"
          />

          <Separator className="my-4" />


          {/* Loading */}

          {evidenceLoading && !evidence && !evidenceError && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                Analyzing GitHub projects...
              </p>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          )}


          {/* Error */}

          {!evidenceLoading && evidenceError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-500">{evidenceError}</p>
            </div>
          )}


          {/* Evidence Loaded */}

          {evidence && !evidenceError && (
            <div className="space-y-6">

              {/* Required Skills */}

              {evidence.requiredSkills?.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    Required skills for this role
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {evidence.requiredSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="px-2.5 py-1 font-normal"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}


              {/* Matched / Missing via GitHub */}

              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    Skills demonstrated through GitHub
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {evidence.matchedSkills?.length > 0 ? (
                      evidence.matchedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="border-green-600/20 bg-green-600/5 px-2.5 py-1 font-normal text-green-700"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No matching skills found in GitHub projects.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                    Skills not demonstrated through GitHub
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {evidence.missingSkills?.length > 0 ? (
                      evidence.missingSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="border-dashed px-2.5 py-1 font-normal text-muted-foreground"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        All required skills are demonstrated through
                        GitHub.
                      </p>
                    )}
                  </div>
                </div>

              </div>


              <Separator />


              {/* Relevant Repositories */}

              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <FolderGit2 className="h-3.5 w-3.5" />
                  Relevant repositories
                </h3>

                {evidence.relevantRepositories?.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {evidence.relevantRepositories.map((repo) => (
                      <div
                        key={repo.htmlUrl}
                        className="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="flex items-center gap-2 text-sm font-semibold">
                              <FolderGit2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">{repo.name}</span>
                            </h4>

                            {repo.description && (
                              <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                {repo.description}
                              </p>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-2"
                            onClick={() => {
                              window.open(
                                repo.htmlUrl,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </Button>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                          {repo.language && (
                            <Badge variant="secondary" className="font-normal">
                              {repo.language}
                            </Badge>
                          )}

                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3.5 w-3.5" />
                            <span className="tabular-nums">{repo.stars}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <GitFork className="h-3.5 w-3.5" />
                            <span className="tabular-nums">{repo.forks}</span>
                          </span>
                        </div>

                        {repo.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {repo.topics.map((topic) => (
                              <Badge
                                key={topic}
                                variant="outline"
                                className="font-normal"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No relevant repositories found for the required
                    skills.
                  </p>
                )}
              </div>

            </div>
          )}


          {/* No Evidence */}

          {!evidenceLoading && !evidenceError && !evidence && (
            <p className="text-sm text-muted-foreground">
              No GitHub evidence available.
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default MatchAnalysis;