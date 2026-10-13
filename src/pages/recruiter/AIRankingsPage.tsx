import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getRecruiterJobs } from "../../api/jobApi";
import { getRecruiterApplications } from "../../api/applicationApi";
import type { RecruiterApplicationResponse } from "../../types/application";
import type { JobResponse } from "../../types/job";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const DETAILS_PATH = "/recruiter/applicants";
const buttonClass = "h-11 gap-2 rounded-xl px-5 text-sm font-medium";

type ScoreKind = "combined" | "resume" | null;

interface RankedApplication {
  app: RecruiterApplicationResponse;
  score: number | null;
  scoreKind: ScoreKind;
  rank: number | null;
}

function isValidScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toList(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.split(",");
  return items.map((item) => String(item).trim()).filter(Boolean);
}

function buildRanking(applications: RecruiterApplicationResponse[]): RankedApplication[] {
  const ranked: RankedApplication[] = applications.map((app) => {
    if (isValidScore(app.combinedScore)) {
      return { app, score: app.combinedScore, scoreKind: "combined", rank: null };
    }
    if (isValidScore(app.matchScore)) {
      return { app, score: app.matchScore, scoreKind: "resume", rank: null };
    }
    return { app, score: null, scoreKind: null, rank: null };
  });

  const nameOf = (item: RankedApplication) =>
    (item.app.candidateName ?? "").toLocaleLowerCase();

  ranked.sort((a, b) => {
    if (a.score !== null && b.score !== null) {
      if (a.score !== b.score) return b.score - a.score;
      return nameOf(a).localeCompare(nameOf(b));
    }
    if (a.score !== null) return -1;
    if (b.score !== null) return 1;
    return nameOf(a).localeCompare(nameOf(b));
  });

  let position = 0;
  for (const item of ranked) {
    if (item.score !== null) item.rank = ++position;
  }
  return ranked;
}

function statusLabel(status?: string | null): string {
  return status ? status.replace(/_/g, " ") : "Unknown";
}

function statusClass(status?: string | null): string {
  switch ((status ?? "").toUpperCase()) {
    case "SHORTLISTED":
      return "text-emerald-600";
    case "REJECTED":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  tint,
  loading,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tint: string;
  loading: boolean;
}) {
  return (
    <div className="flex items-start justify-between rounded-2xl border p-5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {loading ? (
          <div className="mt-3 h-8 w-10 animate-pulse rounded bg-muted" />
        ) : (
          <p className="mt-2 text-3xl font-bold">{value}</p>
        )}
      </div>
      <div className={`rounded-xl p-2.5 ${tint}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </div>
  );
}

function SkillChips({
  skills,
  tone,
}: {
  skills: string[];
  tone: "match" | "missing";
}) {
  const chipClass =
    tone === "match"
      ? "border-emerald-300 text-emerald-700"
      : "border-border text-muted-foreground";

  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.slice(0, 8).map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className={`rounded-full border px-2.5 py-0.5 text-xs ${chipClass}`}
        >
          {skill}
        </span>
      ))}
      {skills.length > 8 && (
        <span className="px-1 py-0.5 text-xs text-muted-foreground">
          +{skills.length - 8} more
        </span>
      )}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div aria-hidden="true" className="h-48 animate-pulse rounded-2xl border p-6">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-4 w-36 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-6 h-2 w-full rounded bg-muted" />
      <div className="mt-5 h-4 w-2/3 rounded bg-muted" />
    </div>
  );
}

export default function AIRankingsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsFailed, setJobsFailed] = useState(false);
  const [jobId, setJobId] = useState<number | null>(null);

  const [applicants, setApplicants] = useState<RecruiterApplicationResponse[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsFailed, setAppsFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const requestId = useRef(0);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsFailed(false);
    try {
      const { data } = await getRecruiterJobs();
      const availableJobs = Array.isArray(data) ? data : [];
      setJobs(availableJobs);
      setJobId((current) =>
        current !== null && availableJobs.some((job) => job.id === current)
          ? current
          : availableJobs.length > 0
            ? availableJobs[0].id
            : null,
      );
    } catch (error) {
      console.error("Failed to load recruiter jobs", error);
      setJobsFailed(true);
      toast.error("Failed to load your jobs.");
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const loadApplicants = useCallback(async (id: number) => {
    const thisRequest = ++requestId.current;
    setAppsLoading(true);
    setAppsFailed(false);
    try {
      const { data } = await getRecruiterApplications(id);
      if (thisRequest !== requestId.current) return;
      setApplicants(Array.isArray(data) ? data : []);
    } catch (error) {
      if (thisRequest !== requestId.current) return;
      console.error("Failed to load recruiter applicants", error);
      setApplicants([]);
      setAppsFailed(true);
      toast.error("Failed to load applicants.");
    } finally {
      if (thisRequest === requestId.current) setAppsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (jobId === null) {
      requestId.current += 1;
      setApplicants([]);
      setAppsLoading(false);
      return;
    }
    setSearch("");
    setStatusFilter("ALL");
    void loadApplicants(jobId);
  }, [jobId, loadApplicants]);

  const handleRefresh = () => {
    if (jobsFailed || (jobId === null && jobs.length === 0)) {
      void loadJobs();
    } else if (jobId !== null) {
      void loadApplicants(jobId);
    }
  };

  const ranked = useMemo(() => buildRanking(applicants), [applicants]);
  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(
          applicants
            .map((app) => (app.status ?? "").toUpperCase())
            .filter(Boolean),
        ),
      ).sort(),
    [applicants],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return ranked.filter(({ app }) => {
      if (
        statusFilter !== "ALL" &&
        (app.status ?? "").toUpperCase() !== statusFilter
      ) {
        return false;
      }
      if (!query) return true;
      return (
        (app.candidateName ?? "").toLocaleLowerCase().includes(query) ||
        (app.candidateEmail ?? "").toLocaleLowerCase().includes(query)
      );
    });
  }, [ranked, search, statusFilter]);

  const total = applicants.length;
  const shortlisted = applicants.filter(
    (app) => (app.status ?? "").toUpperCase() === "SHORTLISTED",
  ).length;
  const scored = ranked.filter((item) => item.score !== null).length;
  const filtersActive = search.trim() !== "" || statusFilter !== "ALL";
  const busy = jobsLoading || appsLoading;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          AI-powered hiring intelligence
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">AI Candidate Rankings</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Compare applicants using their available match scores, matching skills, and missing skills.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 sm:max-w-md">
            <label htmlFor="ranking-job-select" className="mb-1.5 block text-sm font-medium">
              Job
            </label>
            <select
              id="ranking-job-select"
              value={jobId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setJobId(value === "" ? null : Number(value));
              }}
              disabled={jobsLoading || jobs.length === 0}
              className="h-11 w-full rounded-xl border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {jobs.length === 0 && (
                <option value="">{jobsLoading ? "Loading jobs..." : "No jobs available"}</option>
              )}
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={busy}
            aria-label="Refresh rankings"
            className={buttonClass}
          >
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} aria-hidden="true" />
            {busy ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </section>

      {jobsFailed ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-red-300 px-6 py-14 text-center">
          <div className="rounded-xl bg-red-50 p-3"><AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">Couldn't load your jobs</h2>
          <p className="max-w-sm text-sm text-muted-foreground">Something went wrong while fetching your jobs.</p>
          <Button onClick={() => void loadJobs()} className={buttonClass}>Try again</Button>
        </div>
      ) : !jobsLoading && jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border px-6 py-16 text-center">
          <div className="rounded-xl bg-blue-50 p-3.5"><Briefcase className="h-7 w-7 text-blue-500" aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">No jobs posted yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">Create a job and receive applications to see rankings here.</p>
          <Link
  to="/recruiter/jobs/create"
  className={`${buttonClass} mt-2 inline-flex items-center justify-center`}
>
  Create Job
</Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Applicants" value={total} icon={Users} tint="bg-blue-50 text-blue-500" loading={busy} />
            <StatCard label="Shortlisted" value={shortlisted} icon={CheckCircle2} tint="bg-amber-50 text-amber-500" loading={busy} />
            <StatCard label="Scored Applicants" value={scored} icon={Target} tint="bg-emerald-50 text-emerald-500" loading={busy} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                aria-label="Search candidates"
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className="h-11 rounded-xl border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-52"
            >
              <option value="ALL">All statuses</option>
              {statusOptions.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
            </select>
            {filtersActive && (
              <Button type="button" variant="outline" onClick={clearFilters} className="h-11 gap-2 rounded-xl px-4">
                <X className="h-4 w-4" aria-hidden="true" /> Clear
              </Button>
            )}
          </div>

          {appsLoading ? (
            <div className="space-y-4" aria-busy="true"><RowSkeleton /><RowSkeleton /><RowSkeleton /></div>
          ) : appsFailed ? (
            <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-red-300 px-6 py-14 text-center">
              <div className="rounded-xl bg-red-50 p-3"><AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" /></div>
              <h2 className="text-lg font-semibold">Couldn't load applicants</h2>
              <p className="max-w-sm text-sm text-muted-foreground">Something went wrong while fetching applicants for this job.</p>
              <Button onClick={() => jobId !== null && void loadApplicants(jobId)} className={buttonClass}>Try again</Button>
            </div>
          ) : total === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border px-6 py-16 text-center">
              <div className="rounded-xl bg-blue-50 p-3.5"><Users className="h-7 w-7 text-blue-500" aria-hidden="true" /></div>
              <h2 className="text-lg font-semibold">No applicants yet</h2>
              <p className="max-w-sm text-sm text-muted-foreground">Candidates who apply to this job will appear here, ranked by their available match score.</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border px-6 py-14 text-center">
              <h2 className="text-lg font-semibold">No applicants match your filters</h2>
              <p className="text-sm text-muted-foreground">Try a different search or status.</p>
              <Button variant="outline" onClick={clearFilters} className={`${buttonClass} mt-1`}>Clear filters</Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {visible.map(({ app, score, scoreKind, rank }) => {
                const matching = toList(app.matchingSkills);
                const missing = toList(app.missingSkills);
                const summary = app.resumeSummary?.trim();
                const isTopThree = rank !== null && rank <= 3;
                const name = app.candidateName?.trim() || "Unnamed candidate";
                const percentage = score === null ? 0 : Math.min(100, Math.max(0, score));

                return (
                  <li key={app.applicationId}>
                    <article className={`rounded-2xl border p-5 transition-shadow hover:shadow-md sm:p-6 ${isTopThree ? "border-foreground shadow-sm" : "border-border"}`}>
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${rank !== null ? "border-border" : "border-dashed text-muted-foreground"}`}
                            aria-label={rank !== null ? `Rank ${rank}` : "Not ranked"}
                          >
                            {rank !== null ? `#${rank}` : "—"}
                          </div>
                          <div className="min-w-0">
                            <h2 className="break-words text-lg font-semibold leading-snug">{name}</h2>
                            {app.candidateEmail && <p className="break-all text-sm text-muted-foreground">{app.candidateEmail}</p>}
                            <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${statusClass(app.status)}`}>{statusLabel(app.status)}</p>
                          </div>
                        </div>

                        <div className="sm:w-56 sm:shrink-0 sm:text-right">
                          {score !== null ? (
                            <>
                              <p className="text-3xl font-bold">{Math.round(score)}%</p>
                              <p className="text-xs text-muted-foreground">{scoreKind === "combined" ? "Combined Match Score" : "Resume Match Score"}</p>
                              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={`${name} match score`}>
                                <div className="h-full rounded-full bg-foreground" style={{ width: `${percentage}%` }} />
                              </div>
                            </>
                          ) : <p className="text-sm font-medium text-muted-foreground">Not ranked — no score available</p>}
                        </div>
                      </div>

                      {(matching.length > 0 || missing.length > 0 || summary) && (
                        <div className="mt-5 space-y-4 border-t border-border pt-5">
                          {matching.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matching skills</p><SkillChips skills={matching} tone="match" /></div>}
                          {missing.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missing skills</p><SkillChips skills={missing} tone="missing" /></div>}
                          {summary && <p className="line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">{summary}</p>}
                        </div>
                      )}

                      <div className="mt-5">
                      <Link
  to={DETAILS_PATH}
  aria-label={`View applicant details for ${name}`}
  className={`${buttonClass} inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground`}
>
  View Applicants
</Link>
                      
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
