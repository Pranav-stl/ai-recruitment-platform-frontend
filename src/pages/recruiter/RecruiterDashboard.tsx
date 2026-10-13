import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  ClipboardList,
  Inbox,
  Plus,
  Sparkles,
  Target,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  getRecruiterDashboard,
  getRecruiterApplicationsByJob,
} from "../../api/applicationApi";
import type {
  RecruiterApplicationResponse,
  RecruiterDashboard as RecruiterDashboardData,
} from "../../types/application";
import { getRecruiterJobs } from "../../api/jobApi";
import type { JobResponse } from "../../types/job";

const QUICK_ACTIONS = [
  { label: "Create a Job", description: "Post a new job listing", icon: Plus, href: "/recruiter/jobs/create" },
  { label: "Manage Jobs", description: "View your job listings", icon: Briefcase, href: "/recruiter/jobs" },
  { label: "Review Applications", description: "Go through incoming applicants", icon: ClipboardList, href: "/recruiter/applicants" },
  { label: "AI Rankings", description: "See top-matched candidates", icon: Trophy, href: "/recruiter/ai-rankings" },
] as const;

export default function RecruiterDashboard() {
  const [dashboard, setDashboard] = useState<RecruiterDashboardData | null>(null);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [topCandidates, setTopCandidates] = useState<RecruiterApplicationResponse[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const [dashboardRes, jobsRes] = await Promise.all([
        getRecruiterDashboard(),
        getRecruiterJobs(),
      ]);

      setDashboard(dashboardRes.data);
      setJobs(jobsRes.data);

      const allCandidates: RecruiterApplicationResponse[] = [];

      for (const job of jobsRes.data) {
        const { data } = await getRecruiterApplicationsByJob(job.id);
        allCandidates.push(...data);
      }

      allCandidates.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

      setTopCandidates(allCandidates.slice(0, 5));
    };

    loadDashboard();
  }, []);

  const stats = [
    {
      label: "Total Jobs",
      value: dashboard?.totalJobs ?? 0,
      hint: "Jobs you've posted",
      icon: Briefcase,
      tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Applications",
      value: dashboard?.totalApplications ?? 0,
      hint: "Across all jobs",
      icon: Users,
      tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Average Match Score",
      value: `${Math.round(dashboard?.averageMatchScore ?? 0)}%`,
      hint: "AI compatibility score",
      icon: Target,
      tint: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Shortlisted",
      value: dashboard?.shortlistedApplications ?? 0,
      hint: "Shortlisted applications",
      icon: UserCheck,
      tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="rounded-2xl border bg-card p-6 sm:p-8">
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-powered hiring intelligence
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back 👋
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Manage your jobs, review applicants, and evaluate candidates with AI
          match insights.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link to="/recruiter/jobs/create">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Job
            </Button>
          </Link>
          <Link to="/recruiter/jobs">
            <Button variant="outline">
              <Briefcase className="mr-1.5 h-4 w-4" />
              View All Jobs
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="gap-0 rounded-2xl py-0 shadow-none transition-shadow hover:shadow-md"
            >
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.tint}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Jobs */}
        <Card className="rounded-2xl shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Recent Jobs</CardTitle>
              <CardDescription>Your posted roles and their status.</CardDescription>
            </div>
            <Link to="/recruiter/jobs">
              <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No jobs posted yet</p>
                  <p className="text-xs text-muted-foreground">
                    Create your first job to start receiving applications.
                  </p>
                </div>
                <Link to="/recruiter/jobs/create">
                  <Button size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create your first job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Job Title</TableHead>
                      <TableHead className="text-right text-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id} className="transition-colors hover:bg-muted/50">
                        <TableCell className="max-w-[18rem] truncate font-semibold">
                          {job.title}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`text-xs font-semibold uppercase tracking-wide ${
                              job.active
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {job.active ? "Active" : "Closed"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top AI Candidates */}
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-base font-semibold">Top AI Candidates</CardTitle>
                <CardDescription>Highest-matched applicants.</CardDescription>
              </div>
            </div>
            <Link to="/recruiter/ai-rankings" className="shrink-0">
              <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topCandidates.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                  <Inbox className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No applications yet</p>
                <p className="max-w-[16rem] text-xs text-muted-foreground">
                  Top-matched candidates will appear here once people apply to your jobs.
                </p>
              </div>
            ) : (
              topCandidates.map((candidate) => {
                const score = candidate.matchScore ?? 0;
                return (
                  <div
                    key={candidate.applicationId}
                    className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {candidate.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{candidate.candidateName}</p>
                        <span className="text-sm font-bold tabular-nums">{score}%</span>
                      </div>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {candidate.status}
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          <CardDescription>Jump straight into common recruiter tasks.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}