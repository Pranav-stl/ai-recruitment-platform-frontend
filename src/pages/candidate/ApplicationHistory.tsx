import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Building2,
  CalendarDays,
  ChevronRight,
  FileText,
  Inbox,
} from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";
import { useAuth } from "../../auth/useAuth";
import { getApplicationsByUser } from "../../api/applicationApi";
import type { ApplicationResponse } from "../../types/application";

function statusBadgeClasses(status: string) {
  switch (status) {
    case "SHORTLISTED":
      return "bg-primary/10 text-primary border-primary/20";

    case "REVIEWED":
      return "bg-sky-500/10 text-sky-600 border-sky-500/20";

    case "APPLIED":
      return "bg-muted text-muted-foreground border-border";

    case "REJECTED":
      return "bg-destructive/10 text-destructive border-destructive/20";

    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function statusDotClasses(status: string) {
  switch (status) {
    case "SHORTLISTED":
      return "bg-primary";
    case "REVIEWED":
      return "bg-sky-500";
    case "REJECTED":
      return "bg-destructive";
    default:
      return "bg-muted-foreground";
  }
}

function matchBadgeClasses(score: number) {
  if (score >= 85) return "bg-primary/10 text-primary border-primary/20";
  if (score >= 70) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border";
}

function matchStrokeClass(score: number) {
  if (score >= 85) return "stroke-primary";
  if (score >= 70) return "stroke-amber-500";
  return "stroke-muted-foreground";
}

function MatchRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="44" height="44" viewBox="0 0 36 36">
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
          className={matchStrokeClass(clamped)}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums">
        {clamped}
      </span>
    </div>
  );
}

function ApplicationsSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-14 w-48" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApplicationHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadApplications = async () => {
      try {
        const response = await getApplicationsByUser();
        console.log(response);
        console.log(response.data);
        setApplications(response.data);
        console.log("History score fields:", response.data.map(app => ({
  jobTitle: app.jobTitle,
  matchScore: app.matchScore,
  combinedScore: app.combinedScore
})));
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  if (loading) {
    return <ApplicationsSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered tracking
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Application History
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
            Track the status of every role you've applied to.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-2.5 shadow-sm md:w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
            </p>
            <p className="text-xs text-muted-foreground">Submitted so far</p>
          </div>
        </div>
      </div>

      {/* List */}
      {applications.length === 0 ? (
        <Card className="border-dashed border-border/70 shadow-none">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              No applications yet
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Roles you apply to will appear here along with their status and
              AI match score.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => {
            const score =
  typeof application.combinedScore === "number" &&
  Number.isFinite(application.combinedScore)
    ? application.combinedScore
    : null;
            const initial =
              (application.company || "").trim().charAt(0).toUpperCase() ||
              "?";

            return (
              <Card
                key={application.id}
                className="group gap-0 border-border/60 bg-card py-0 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:gap-6">
                  {/* Job + company */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-base font-semibold text-primary">
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-[15px] font-semibold leading-snug transition-colors group-hover:text-primary">
                        {application.jobTitle}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{application.company}</span>
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:flex-nowrap">
                    <div className="min-w-[120px]">
                      <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                        Status
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 whitespace-nowrap font-normal",
                          statusBadgeClasses(application.status)
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            statusDotClasses(application.status)
                          )}
                        />
                        {application.status}
                      </Badge>
                    </div>

                    <div className="min-w-[110px]">
                      <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                        Applied
                      </p>
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {score !== null && (
                      <div className="flex items-center gap-2.5">
                        <MatchRing score={score} />
                        <div>
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                            AI match
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1 whitespace-nowrap font-normal",
                              matchBadgeClasses(score)
                            )}
                          >
                            <Sparkles className="h-3 w-3" />
                            {score}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="lg:ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1 lg:w-auto"
                      onClick={() =>
                        navigate(
                          `/candidate/match-analysis/${application.id}`
                        )
                      }
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}