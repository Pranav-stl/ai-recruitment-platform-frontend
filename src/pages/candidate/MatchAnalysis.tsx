import {
  Sparkles,
  CheckCircle2,
  XCircle,
  GraduationCap,
  FileText,
  Briefcase,
  Send,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { cn } from "../../lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { matchApplication } from "../../api/applicationApi";
import type { JobMatchResponse } from "../../types/application";




function matchTextColor(score: number) {
  if (score >= 85) return "text-primary";
  if (score >= 70) return "text-amber-600";
  return "text-muted-foreground";
}

export default function MatchAnalysis() {

  const { applicationId } = useParams();

  const [data, setData] =
    useState<JobMatchResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    async function loadMatch() {

      try {

        const response =
          await matchApplication(Number(applicationId));

        setData(response.data);

      } catch (e) {

        console.error(e);

        setError("Failed to load AI Match Analysis.");

      } finally {

        setLoading(false);

      }

    }

    if (applicationId)
      loadMatch();

  }, [applicationId]);

  if (loading)
  return <p>Loading AI analysis...</p>;

if (error)
  return <p>{error}</p>;

if (!data)
  return <p>No analysis found.</p>;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Match Analysis</h1>
         <p className="mt-1 text-sm text-muted-foreground">
    AI-powered analysis of your application.
</p>
        </div>
      </div>

      {/* AI Match Score card */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">AI Match Score</h2>
        </div>

        <div className="mt-3 flex items-end gap-1.5">
          <span className={cn("text-4xl font-semibold tracking-tight", matchTextColor(data.matchScore))}>
            {data.matchScore}%
          </span>
          <span className="mb-1.5 text-sm text-muted-foreground">match with this role</span>
        </div>
      

        <Separator className="my-5" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Matching skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.matchingSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-primary/20 bg-primary/10 font-normal text-primary"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
              Missing skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.missingSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="font-normal text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resume Summary + Job Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Resume Summary</h2>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
          <p className="text-sm leading-relaxed text-muted-foreground">
    {data.resumeSummary}
</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Job Summary</h2>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            <p className="text-sm leading-relaxed text-muted-foreground">
    {data.jobSummary}
</p>
</div>
</div>
<div className="rounded-xl border border-border bg-card p-5 sm:p-6">

  <div className="flex items-center gap-2">

    <Sparkles className="h-4 w-4 text-primary"/>

    <h2 className="text-base font-semibold">
      AI Evaluation
    </h2>

  </div>

  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">

    {data.analysis}

  </p>

</div>
          </div>
        

      {/* Recommended Courses */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Recommended Courses</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Close your skill gaps for this role with these picks.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {data.recommendedCourses.map((course) => (
            <div
              key={course.skill}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{course.course}</p>
                  <a
    href={course.url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-blue-600 underline flex items-center gap-1"
>
    View Course
    <ExternalLink className="h-3 w-3" />
</a>
                  <Badge variant="secondary" className="font-normal">
                    {course.skill}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{course.provider}</span>
                
                </div>
              </div>
              <p className="max-w-sm text-xs text-muted-foreground">
    {course.reason}
</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-5">
       
      </div>
    </div>
  );
}