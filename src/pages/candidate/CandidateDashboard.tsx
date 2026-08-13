import {
  FileText,
  Briefcase,
  Target,
  Compass,
  Upload,
  Search,
  ClipboardList,
  CheckCircle2,
  XCircle,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
//import { Progress } from "../../components/ui/progress";
import { useEffect, useMemo, useState } from "react";
import { getApplicationsByUser } from "../../api/applicationApi";
import { getMyResume } from "../../api/resumeApi";
import type { ApplicationResponse } from "../../types/application";
import type { ResumeResponse } from "../../types/resume";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
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



// ---------------------------------------------------------------------------

export function CandidateDashboard() {

  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const latestApplication =
  applications.length > 0 ? applications[0] : null;

  let recommendedCourses: { course: string; provider: string }[] = [];

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
        const [applicationsRes, resumeRes] = await Promise.allSettled([
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
    (app) => app.matchScore !== null && app.matchScore !== undefined
  );

  if (screenedApplications.length === 0) return 0;

  return Math.round(
    screenedApplications.reduce(
      (sum, app) => sum + (app.matchScore ?? 0),
      0
    ) / screenedApplications.length
  );
}, [applications]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.fullName}! 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
       {[
  {
    label: "Resume Uploaded",
    value: resume ? "1" : "0",
    helper: resume
    ? `${resume.fileName} · ${new Date(resume.uploadedAt).toLocaleDateString()}`
    : "No resume uploaded",
    icon: FileText,
  },
  {
    label: "Jobs Applied",
    value: applications.length.toString(),
    helper: "Applications submitted",
    icon: Briefcase,
  },
  {
    label: "Average AI Match Score",
    value: `${averageMatchScore}%`,
    helper: "Across all applications",
    icon: Target,
  },
  {
  label: "AI External Jobs",
  value: "Ready",
  helper: "Search AI recommended external jobs",
  icon: Compass,
},
].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-start justify-between gap-3 pt-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.helper}</span>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Applications table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications and their status</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground"  onClick={() => navigate("/candidate/applications")}>
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Match Score</TableHead>
                </TableRow>
              </TableHeader>
             <TableBody>
  {applications.length === 0 ? (
    <TableRow>
      <TableCell
        colSpan={5}
        className="py-8 text-center text-muted-foreground"
      >
        You haven't applied for any jobs yet.
      </TableCell>
    </TableRow>
  ) : (
    applications.map((application) => (
      <TableRow key={application.id}>
        <TableCell className="font-medium">
          {application.company}
        </TableCell>

        <TableCell className="text-muted-foreground">
          {application.jobTitle}
        </TableCell>

        <TableCell className="hidden text-muted-foreground sm:table-cell">
          {new Date(application.appliedAt).toLocaleDateString()}
        </TableCell>

        <TableCell>
          <Badge variant={STATUS_BADGE_VARIANT[application.status]}>
            {application.status}
          </Badge>
        </TableCell>

        <TableCell className="text-right font-medium">
          {application.matchScore != null
  ? `${application.matchScore}%`
  : "Pending AI"}
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Based on your resume and recent applications</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {!latestApplication ? (
  <div className="py-6 text-center text-sm text-muted-foreground">
    Apply for a job and run AI Match Analysis to see personalized insights.
  </div>
) : (
  <>
            
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Matching Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {latestApplication?.matchingSkills
  ?.split(",")
  .map((skill) => skill.trim())
  .filter(Boolean)
  .map((skill) => (
    <Badge key={skill} variant="secondary">
      {skill}
    </Badge>
  ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <XCircle className="h-4 w-4 text-amber-500" />
                Missing Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {latestApplication?.missingSkills
  ?.split(",")
  .map((skill) => skill.trim())
  .filter(Boolean)
  .map((skill) => (
    <Badge key={skill} variant="outline">
      {skill}
    </Badge>
  ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <GraduationCap className="h-4 w-4 text-primary" />
                Recommended Courses
              </div>
                <ul className="flex flex-col gap-2">
{recommendedCourses.length > 0 ? (
  recommendedCourses.map((course, index) => (
    <li key={index} className="text-sm">
      <span className="font-medium">
        {course.course}
      </span>
      <span className="text-muted-foreground">
        {" "}
        — {course.provider}
      </span>
    </li>
  ))
) : (
  <li className="text-sm text-muted-foreground">
    No recommendations available
  </li>
)}
</ul>
            </div>
            <div>
  <div className="mb-2 text-sm font-medium">
    Resume Summary
  </div>

  <p className="text-sm text-muted-foreground">
    {latestApplication?.resumeSummary ??
      "No summary available"}
  </p>
</div>

       </>  
)}
          </CardContent>
        </Card>
      </div> 

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump back into your job search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"> <Button className="justify-start gap-2" size="lg" onClick={() => navigate("/candidate/resume")}> <Upload className="h-4 w-4" /> Upload Resume </Button>
            <Button variant="secondary" className="justify-start gap-2" size="lg" onClick={() => navigate("/jobs")}>
              <Search className="h-4 w-4"/>
              Browse Jobs
            </Button>
            <Button variant="outline" className="justify-start gap-2" size="lg" onClick={() => navigate("/candidate/applications")}>
              <ClipboardList className="h-4 w-4" />
              View Applications
            </Button>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}

export default CandidateDashboard;