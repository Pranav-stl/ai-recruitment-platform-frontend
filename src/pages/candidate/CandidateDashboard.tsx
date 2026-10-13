import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Search,
  Target,
  Upload,
  XCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { getApplicationsByUser } from "../../api/applicationApi";
import { getMyResume } from "../../api/resumeApi";
import type { ApplicationResponse } from "../../types/application";
import type { ResumeResponse } from "../../types/resume";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";

import GitHubRepositories from "../../components/ui/GitHubRepositories";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const STATUS_BADGE_VARIANT: Record<
  string,
  "secondary" | "default" | "destructive" | "outline"
> = {
  APPLIED: "secondary",
  REVIEWED: "outline",
  SHORTLISTED: "default",
  REJECTED: "destructive",
  ACCEPTED: "default",
};

export function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const latestApplication =
    applications.length > 0 ? applications[0] : null;

  let recommendedCourses: {
    course: string;
    provider: string;
  }[] = [];

  if (latestApplication?.recommendedCourses) {
    try {
      recommendedCourses = JSON.parse(
        latestApplication.recommendedCourses
      );
    } catch {
      recommendedCourses = [];
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [applicationsRes, resumeRes] =
          await Promise.allSettled([
            getApplicationsByUser(),
            getMyResume(),
          ]);

        if (applicationsRes.status === "fulfilled") {
          setApplications(applicationsRes.value.data);
        }

        if (resumeRes.status === "fulfilled") {
          setResume(resumeRes.value.data);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const averageMatchScore = useMemo(() => {
    const screenedApplications = applications.filter(
      (app) =>
        app.matchScore !== null &&
        app.matchScore !== undefined
    );

    if (screenedApplications.length === 0) {
      return 0;
    }

    return Math.round(
      screenedApplications.reduce(
        (sum, app) => sum + (app.matchScore ?? 0),
        0
      ) / screenedApplications.length
    );
  }, [applications]);

  const recentApplications = applications.slice(0, 5);

  const matchingSkills =
    latestApplication?.matchingSkills
      ?.split(",")
      .map((skill) => skill.trim())
      .filter(Boolean) ?? [];

  const missingSkills =
    latestApplication?.missingSkills
      ?.split(",")
      .map((skill) => skill.trim())
      .filter(Boolean) ?? [];

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="space-y-3">
          <div className="h-5 w-48 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-[32rem] max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="h-80 animate-pulse lg:col-span-2" />
          <Card className="h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">

      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.02] p-7 shadow-sm md:p-9">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered career intelligence
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Welcome back,{" "}
            {user?.fullName?.split(" ")[0] || "there"}.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Track your applications, discover better opportunities,
            and use AI insights to strengthen your career profile.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/jobs")}
              className="gap-2 shadow-sm"
            >
              <Search className="h-4 w-4" />
              Find Jobs
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/candidate/resume")}
              className="gap-2 bg-background/80"
            >
              <FileText className="h-4 w-4" />
              Manage Resume
            </Button>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>


      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Resume */}
        <Card className="group border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
          <CardContent className="flex items-start justify-between p-6">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Resume
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {resume ? "Ready" : "Missing"}
              </p>

              <p className="mt-1 truncate text-xs text-muted-foreground">
                {resume
                  ? "Your profile is ready"
                  : "Upload your resume"}
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-primary/10 p-3 transition-transform duration-200 group-hover:scale-105">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>


        {/* Applications */}
        <Card className="group border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-md">
          <CardContent className="flex items-start justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Applications
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {applications.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Jobs you've applied to
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-blue-500/10 p-3 transition-transform duration-200 group-hover:scale-105">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>


        {/* Match Score */}
        <Card className="group border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/20 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Match
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {averageMatchScore}%
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  AI compatibility score
                </p>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-3 transition-transform duration-200 group-hover:scale-105">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(
                    Math.max(averageMatchScore, 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>


        {/* Profile */}
        <Card className="group border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/20 hover:shadow-md">
          <CardContent className="flex items-start justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Profile Status
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {resume ? "Active" : "Setup"}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {resume
                  ? "Ready for job matching"
                  : "Complete your profile"}
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-violet-500/10 p-3 transition-transform duration-200 group-hover:scale-105">
              <TrendingUp className="h-5 w-5 text-violet-600" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Main Dashboard */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent Applications */}
        <Card className="border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Applications</CardTitle>

              <CardDescription>
                Track your latest applications and AI match scores.
              </CardDescription>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1"
              onClick={() =>
                navigate("/candidate/applications")
              }
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>

                <h3 className="mt-4 font-semibold">
                  No applications yet
                </h3>

                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Start exploring jobs and apply to positions
                  that match your skills.
                </p>

                <Button
                  className="mt-5 gap-2"
                  onClick={() => navigate("/jobs")}
                >
                  <Search className="h-4 w-4" />
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Applied
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        Match
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {recentApplications.map((application) => (
                      <TableRow
                        key={application.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() =>
                          navigate(
                            `/candidate/match-analysis/${application.id}`
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          {application.company}
                        </TableCell>

                        <TableCell className="max-w-[220px] truncate text-muted-foreground">
                          {application.jobTitle}
                        </TableCell>

                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {new Date(
                            application.appliedAt
                          ).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              STATUS_BADGE_VARIANT[
                                application.status
                              ] ?? "outline"
                            }
                          >
                            {application.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          {application.matchScore != null ? (
                            <span className="font-semibold">
                              {Math.round(
                                 application.combinedScore ?? application.matchScore!
                              )}
                              %
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Pending
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>


        {/* AI Insights */}
        <Card className="border-primary/15 bg-gradient-to-b from-primary/[0.025] to-background shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <div>
                <CardTitle>AI Insights</CardTitle>

                <CardDescription>
                  Based on your latest application
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">

            {!latestApplication ? (
              <div className="rounded-xl border border-dashed bg-background/60 py-10 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                  Apply for a job and run AI Match Analysis
                  to receive personalized insights.
                </p>
              </div>
            ) : (
              <>
                {/* Matching Skills */}
                <div className="rounded-xl border bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Matching Skills
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {matchingSkills.length > 0 ? (
                      matchingSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="font-medium"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No matching skills found.
                      </span>
                    )}
                  </div>
                </div>


                {/* Missing Skills */}
                <div className="rounded-xl border bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <XCircle className="h-4 w-4 text-amber-500" />
                    Skills to Improve
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="border-amber-500/30"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No major skill gaps identified.
                      </span>
                    )}
                  </div>
                </div>


                {/* Recommended Learning */}
                <div className="rounded-xl border bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Recommended Learning
                  </div>

                  {recommendedCourses.length > 0 ? (
                    <div className="space-y-2">
                      {recommendedCourses
                        .slice(0, 3)
                        .map((course, index) => (
                          <div
                            key={`${course.course}-${index}`}
                            className="rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                          >
                            <p className="text-sm font-medium">
                              {course.course}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {course.provider}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No course recommendations available.
                    </p>
                  )}
                </div>


                {/* Resume Summary */}
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="mb-2 text-sm font-medium">
                    Resume Summary
                  </p>

                  <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                    {latestApplication.resumeSummary ??
                      "No summary available."}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigate(
                      `/candidate/match-analysis/${latestApplication.id}`
                    )
                  }
                >
                  View Full Match Analysis
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Quick Actions */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and continue your job search.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Resume */}
          <Card
            className="group cursor-pointer border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md"
            onClick={() =>
              navigate("/candidate/resume")
            }
          >
            <CardContent className="p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-105">
                <Upload className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold">
                {resume
                  ? "Update Resume"
                  : "Upload Resume"}
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {resume
                  ? "Keep your resume up to date."
                  : "Upload your resume to enable AI matching."}
              </p>
            </CardContent>
          </Card>


          {/* Jobs */}
          <Card
            className="group cursor-pointer border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/20 hover:shadow-md"
            onClick={() => navigate("/jobs")}
          >
            <CardContent className="p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 transition-transform group-hover:scale-105">
                <Search className="h-5 w-5 text-blue-600" />
              </div>

              <h3 className="font-semibold">
                Browse Jobs
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Discover jobs that match your profile.
              </p>
            </CardContent>
          </Card>


          {/* Applications */}
          <Card
            className="group cursor-pointer border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-md"
            onClick={() =>
              navigate("/candidate/applications")
            }
          >
            <CardContent className="p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 transition-transform group-hover:scale-105">
                <ClipboardList className="h-5 w-5 text-emerald-600" />
              </div>

              <h3 className="font-semibold">
                My Applications
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Track the status of your applications.
              </p>
            </CardContent>
          </Card>


          {/* Profile */}
          <Card
            className="group cursor-pointer border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-md"
            onClick={() =>
              navigate("/candidate/profile")
            }
          >
            <CardContent className="p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 transition-transform group-hover:scale-105">
                <Target className="h-5 w-5 text-violet-600" />
              </div>

              <h3 className="font-semibold">
                Improve Profile
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Update your profile and skills.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>


      {/* GitHub Projects */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            GitHub Projects
            <Badge variant="secondary">
              Evidence
            </Badge>
          </CardTitle>

          <CardDescription>
            Connect your projects to strengthen your skill evidence.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <GitHubRepositories />
        </CardContent>
      </Card>

    </div>
  );
}

export default CandidateDashboard;