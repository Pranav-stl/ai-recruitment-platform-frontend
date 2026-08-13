import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  Sparkles,
  CalendarCheck,
  Plus,
  ClipboardList,
  Trophy,
  ArrowUpRight,
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
//import { Progress } from "..//components/ui/progress";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { useEffect, useState } from "react";
import {
  getRecruiterDashboard,
  getRecruiterApplicationsByJob,
} from "../../api/applicationApi";
import type { RecruiterApplicationResponse, RecruiterDashboard } from "../../types/application";
import { getRecruiterJobs } from "../../api/jobApi";
import type { JobResponse } from "../../types/job";
// ---- Mock data (no API calls) -------------------------------------------


type JobStatus = "Active" | "Paused" | "Closed" | "Draft";

const jobStatusStyles: Record<JobStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Paused: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Closed: "bg-muted text-muted-foreground",
  Draft: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const RECENT_JOBS: {
  title: string;
  applicants: number;
  status: JobStatus;
  postedDate: string;
}[] = [
  { title: "Senior Backend Engineer", applicants: 142, status: "Active", postedDate: "Jul 02, 2026" },
  { title: "Frontend Developer (React)", applicants: 98, status: "Active", postedDate: "Jun 28, 2026" },
  { title: "Data Analyst", applicants: 87, status: "Active", postedDate: "Jul 05, 2026" },
  { title: "DevOps Engineer", applicants: 63, status: "Paused", postedDate: "Jun 20, 2026" },
  { title: "Product Designer", applicants: 51, status: "Closed", postedDate: "Jun 10, 2026" },
  { title: "QA Engineer", applicants: 34, status: "Draft", postedDate: "Jul 08, 2026" },
];

type CandidateStatus = "Shortlisted" | "Interview Scheduled" | "Under Review" | "New";

const candidateStatusStyles: Record<CandidateStatus, string> = {
  Shortlisted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Interview Scheduled": "bg-primary/10 text-primary",
  "Under Review": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  New: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const TOP_CANDIDATES: {
  name: string;
  initials: string;
  jobApplied: string;
  matchScore: number;
  status: CandidateStatus;
}[] = [
  { name: "Ananya Sharma", initials: "AS", jobApplied: "Senior Backend Engineer", matchScore: 94, status: "Shortlisted" },
  { name: "Rahul Verma", initials: "RV", jobApplied: "Frontend Developer", matchScore: 91, status: "Interview Scheduled" },
  { name: "Priya Nair", initials: "PN", jobApplied: "Data Analyst", matchScore: 88, status: "Under Review" },
  { name: "Karan Mehta", initials: "KM", jobApplied: "DevOps Engineer", matchScore: 85, status: "Shortlisted" },
  { name: "Sneha Iyer", initials: "SI", jobApplied: "Frontend Developer", matchScore: 82, status: "New" },
];

const QUICK_ACTIONS = [
  { label: "Post New Job", description: "Create a new job listing", icon: Plus, href: "/recruiter/jobs/create" },
  { label: "View Applicants", description: "Review incoming applications", icon: ClipboardList, href: "/recruiter/applicants" },
  { label: "AI Rankings", description: "See top-matched candidates", icon: Trophy, href: "/recruiter/ai-rankings" },
] as const;

// ---- Page -----------------------------------------------------------------

export default function RecruiterDashboard() {
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);

  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [topCandidates, setTopCandidates] = useState<
  RecruiterApplicationResponse[]
>([]);
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

  allCandidates.sort(
    (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)
  );

  setTopCandidates(allCandidates.slice(0, 5));
};

loadDashboard();
}, []);
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Welcome header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Priya 👋</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your open roles today.
        </p>
      </div>

      {/* 2. Statistic cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
  {
    label: "Active Jobs",
    value: dashboard?.totalJobs ?? 0,
    hint: "Your jobs",
    icon: Briefcase,
  },
  {
    label: "Total Applicants",
    value: dashboard?.totalApplications ?? 0,
    hint: "Across all jobs",
    icon: Users,
  },
  {
    label: "Average AI Match Score",
    value: `${Math.round(dashboard?.averageMatchScore ?? 0)}%`,
    hint: "Across all applications",
    icon: Sparkles,
  },
  {
    label: "Shortlisted",
    value: dashboard?.shortlistedApplications ?? 0,
    hint: "Candidates",
    icon: CalendarCheck,
  },
].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={2.25} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 3. Recent Jobs table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Your most recently posted roles</CardDescription>
            </div>
            <Link to="/recruiter/jobs">
              <Button variant="ghost" size="sm">
              
                View all
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead className="text-right">Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Posted Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.title}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell className="text-right">{}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={job.active ? jobStatusStyles.Active : jobStatusStyles.Closed}
                      >
                        {job.active ? "Active" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 4. Top AI Candidates */}
        <Card>
          <CardHeader>
            <CardTitle>Top AI Candidates</CardTitle>
            <CardDescription>Highest-matched applicants right now</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {topCandidates.map((candidate) => (
              <div key={candidate.applicationId} className="flex items-start gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {candidate.candidateName
  .split(" ")
  .map((n) => n[0])
  .join("")
  .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium leading-none">{candidate.candidateName}</p>
                    <Badge
                      variant="secondary"
              
                    >
                      {candidate.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Match Score: {candidate.matchScore}%</p>
                  
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 5. Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump straight into common recruiter tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={action.href}>
  <Button
    variant="outline"
    className="h-auto w-full flex-col items-start gap-2 whitespace-normal p-4 text-left"
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
      <Icon className="h-4 w-4 text-primary" strokeWidth={2.25} />
    </div>

    <div>
      <p className="text-sm font-medium">{action.label}</p>
      <p className="text-xs font-normal text-muted-foreground">
        {action.description}
      </p>
    </div>
  </Button>
</Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}