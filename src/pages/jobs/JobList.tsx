import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  X,
  AlertCircle,
  IndianRupee,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { getJobs } from "../../api";
import type { JobResponse } from "../../types/job";
import {
  getExternalJobs,
  getRecommendedExternalJobs,
} from "../../api/externalJobApi";
import type { ExternalJobResponse } from "../../types/externalJob";

const LOCATIONS = ["All Locations", "Bengaluru", "Hyderabad", "Pune", "Remote"];

const PAGE_SIZE = 6;

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

/**
 * Reads a match score ONLY if the API already returns one on the job object.
 * Returns null otherwise, so nothing is displayed (no invented scores).
 */
function getMatchScore(job: JobResponse): number | null {
  const record = job as unknown as Record<string, unknown>;
  const raw = record.matchScore ?? record.matchPercentage;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function getPageItems(current: number, total: number): (number | "ellipsis-l" | "ellipsis-r")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis-l" | "ellipsis-r")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis-l");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis-r");
  items.push(total);
  return items;
}

function MatchRing({ score }: { score: number }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

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
          className={matchStrokeClass(score)}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums">
        {score}
      </span>
    </div>
  );
}

function CompanyAvatar({
  name,
  external = false,
}: {
  name: string;
  external?: boolean;
}) {
  const initial = (name || "").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-base font-semibold",
        external
          ? "border-border bg-muted text-muted-foreground"
          : "border-primary/15 bg-primary/10 text-primary"
      )}
    >
      {initial}
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-5 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-4">
        <div className="space-y-2">
          <div className="h-3 w-10 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = PAGE_SIZE }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed border-border/70 shadow-none">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
          {icon}
        </div>
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  );
}

export default function JobList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [experience, setExperience] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loadingInternal, setLoadingInternal] = useState(true);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [error, setError] = useState("");
  const [jobSource, setJobSource] = useState<"internal" | "external">("internal");
  const [externalJobs, setExternalJobs] = useState<ExternalJobResponse[]>([]);
  const [externalPage, setExternalPage] = useState(1);

  useEffect(() => {
    setExternalPage(1);
  }, [searchTerm, location]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();

        console.log("Jobs from backend:", response.data);

        setJobs(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs.");
      } finally {
        setLoadingInternal(false);
      }
    };

    fetchJobs();
  }, []);

  const fetchExternalJobs = async () => {
    console.log("fetchExternalJobs()");
    if (searchTerm.trim().length > 0 && searchTerm.trim().length < 3) {
      setExternalJobs([]);
      return;
    }
    try {
      setLoadingExternal(true);
      let response;

      if (searchTerm.trim() === "") {
        console.log("Calling recommended endpoint...");
        response = await getRecommendedExternalJobs();
      } else {
        console.log("Calling search endpoint...");
        response = await getExternalJobs(
          searchTerm.trim(),
          location === "All Locations" ? "" : location,
          externalPage
        );
      }

      setExternalJobs(response.data);
      console.log(response.data);
    } catch (error: any) {
      console.error(error);

      if (error?.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      }
    } finally {
      setLoadingExternal(false);
    }
  };

  useEffect(() => {
    if (jobSource !== "external") return;

    const timer = setTimeout(() => {
      fetchExternalJobs();
    }, 500);

    return () => clearTimeout(timer);
  }, [jobSource, searchTerm, location, externalPage]);

  const filteredJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        query.length === 0 ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.requiredSkills.toLowerCase().includes(query);

      const matchesLocation =
        location === "All Locations" || job.location === location;

      const matchesExperience =
        experience === "" ||
        (experience === "0-2" && job.experience <= 2) ||
        (experience === "2-5" && job.experience > 2 && job.experience <= 5) ||
        (experience === "5-8" && job.experience > 5 && job.experience <= 8) ||
        (experience === "8+" && job.experience > 8);

      return matchesQuery && matchesLocation && matchesExperience;
    });
  }, [jobs, searchTerm, location, experience]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, location, experience]);

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    location !== "All Locations" ||
    experience !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("All Locations");
    setExperience("");
  };

  const searchTooShort =
    searchTerm.trim().length > 0 && searchTerm.trim().length < 3;

  const externalCountLabel =
    jobSource !== "external" && externalJobs.length === 0
      ? "–"
      : String(externalJobs.length);

  const selectClasses =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered job discovery
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Find your next opportunity
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
            Discover roles that match your skills, experience and career goals.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-2.5 shadow-sm md:w-fit">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md",
              jobSource === "internal"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {jobSource === "internal" ? (
              <Briefcase className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {jobSource === "internal"
                ? `${filteredJobs.length} open ${
                    filteredJobs.length === 1 ? "role" : "roles"
                  }`
                : `${externalJobs.length} AI recommended ${
                    externalJobs.length === 1 ? "job" : "jobs"
                  }`}
            </p>
            <p className="text-xs text-muted-foreground">
              {jobSource === "internal"
                ? "Available on TalentSync"
                : "Found through external search"}
            </p>
          </div>
        </div>
      </div>

      {/* Source selector + filters */}
      <div className="flex flex-col gap-3">
        <div
          role="tablist"
          aria-label="Job source"
          className="grid w-full grid-cols-2 gap-1 rounded-lg border bg-muted/50 p-1 sm:inline-grid sm:w-fit"
        >
          <button
            type="button"
            role="tab"
            aria-selected={jobSource === "internal"}
            onClick={() => setJobSource("internal")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
              jobSource === "internal"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase
              className={cn(
                "h-4 w-4",
                jobSource === "internal" && "text-primary"
              )}
            />
            Platform Jobs
            <span
              className={cn(
                "min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums leading-none",
                jobSource === "internal"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {loadingInternal ? "–" : filteredJobs.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={jobSource === "external"}
            onClick={() => setJobSource("external")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
              jobSource === "external"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles
              className={cn(
                "h-4 w-4",
                jobSource === "external" && "text-primary"
              )}
            />
            AI Recommended
            <span
              className={cn(
                "min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums leading-none",
                jobSource === "external"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {externalCountLabel}
            </span>
          </button>
        </div>

        <div className="grid gap-2.5 rounded-xl border border-border/60 bg-card p-3 shadow-sm md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                jobSource === "internal"
                  ? "Search jobs, companies or skills..."
                  : "Search external jobs..."
              }
              className="h-10 border-border/70 bg-background pl-9"
            />
          </div>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location"
            className={selectClasses}
          >
            {LOCATIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            aria-label="Experience"
            className={selectClasses}
          >
            <option value="">All Experience</option>
            <option value="0-2">0–2 Years</option>
            <option value="2-5">2–5 Years</option>
            <option value="5-8">5–8 Years</option>
            <option value="8+">8+ Years</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              className="h-10 gap-1.5 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {error ? (
        <EmptyState
          icon={<AlertCircle className="h-5 w-5 text-destructive" />}
          title="Something went wrong"
          description={error}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          }
        />
      ) : jobSource === "internal" ? (
        <>
          {loadingInternal ? (
            <SkeletonGrid />
          ) : paginatedJobs.length === 0 ? (
            jobs.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-5 w-5 text-muted-foreground" />}
                title="No open roles yet"
                description="There are no jobs posted on the platform right now. Check back soon, or explore AI recommended jobs."
                action={
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setJobSource("external")}
                  >
                    <Sparkles className="h-4 w-4" />
                    Browse AI Recommended
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<Search className="h-5 w-5 text-muted-foreground" />}
                title="No jobs match your search"
                description="Try changing your search terms, location or experience filters."
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            )
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedJobs.map((job) => {
                const skills = job.requiredSkills
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean);
                const score = getMatchScore(job);

                return (
                  <Card
                    key={job.id}
                    className="group flex h-full flex-col gap-0 overflow-hidden border-border/60 bg-card py-0 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                  >
                    <CardContent className="flex flex-1 flex-col gap-4 p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <CompanyAvatar name={job.company} />

                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug transition-colors group-hover:text-primary">
                              {job.title}
                            </h3>
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                              {job.company}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0 gap-1.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Open
                        </Badge>
                      </div>

                      {/* AI match (only when the API provides it) */}
                      {score !== null && (
                        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                          <MatchRing score={score} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold">
                                {score}% Match
                              </p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "gap-1 text-[10px] font-medium",
                                  matchBadgeClasses(score)
                                )}
                              >
                                <Sparkles className="h-3 w-3" />
                                AI
                              </Badge>
                            </div>
                            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  score >= 85
                                    ? "bg-primary"
                                    : score >= 70
                                    ? "bg-amber-500"
                                    : "bg-muted-foreground"
                                )}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.experience} {job.experience === 1 ? "year" : "years"}
                        </span>
                      </div>

                      {/* Skills */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.slice(0, 5).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="font-normal"
                            >
                              {skill}
                            </Badge>
                          ))}

                          {skills.length > 5 && (
                            <Badge variant="outline" className="font-normal">
                              +{skills.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between gap-4 border-t pt-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Salary
                          </p>
                          <p className="mt-0.5 text-base font-semibold tabular-nums">
                            ₹{job.salary.toLocaleString()}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View Job
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Internal pagination */}
          {!loadingInternal && filteredJobs.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
                <span className="hidden sm:inline">
                  {" "}
                  • {filteredJobs.length}{" "}
                  {filteredJobs.length === 1 ? "role" : "roles"}
                </span>
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="hidden items-center gap-1 sm:flex">
                  {getPageItems(currentPage, totalPages).map((item) =>
                    typeof item === "number" ? (
                      <Button
                        key={item}
                        variant={item === currentPage ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 text-xs tabular-nums"
                        onClick={() => setCurrentPage(item)}
                      >
                        {item}
                      </Button>
                    ) : (
                      <span
                        key={item}
                        className="w-6 text-center text-xs text-muted-foreground"
                      >
                        …
                      </span>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : loadingExternal ? (
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            Finding AI-recommended jobs...
          </p>
          <SkeletonGrid />
        </div>
      ) : externalJobs.length === 0 ? (
        searchTooShort ? (
          <EmptyState
            icon={<Search className="h-5 w-5 text-muted-foreground" />}
            title="Keep typing to search"
            description="Enter at least 3 characters to search external jobs."
          />
        ) : (
          <EmptyState
            icon={<Sparkles className="h-5 w-5 text-primary" />}
            title="No external jobs found"
            description="Try another keyword or location to discover more opportunities."
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {externalJobs.map((job) => (
              <Card
                key={job.id}
                className="group relative flex h-full flex-col gap-0 overflow-hidden border-border/60 bg-card py-0 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div className="h-0.5 w-full bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

                <CardContent className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <CompanyAvatar name={job.company} external />

                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug transition-colors group-hover:text-primary">
                          {job.title}
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className="shrink-0 gap-1 border-primary/20 bg-primary/5 text-primary"
                    >
                      <Globe className="h-3 w-3" />
                      External
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location || "Location not specified"}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {job.description || "No description available."}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Salary
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-sm font-semibold">
                        {job.salary ? (
                          job.salary
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                            <IndianRupee className="h-3.5 w-3.5" />
                            Not disclosed
                          </span>
                        )}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      disabled={!job.redirectUrl}
                      onClick={() => {
                        if (job.redirectUrl) {
                          window.open(
                            job.redirectUrl,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }
                      }}
                    >
                      {job.redirectUrl ? "Apply on Adzuna" : "Unavailable"}
                      {job.redirectUrl && <ExternalLink className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* External pagination */}
          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Page {externalPage}
              {externalJobs.length > 0 &&
                ` • Showing ${externalJobs.length} jobs`}
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={externalPage === 1}
                onClick={() =>
                  setExternalPage((page) => Math.max(1, page - 1))
                }
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={externalJobs.length < PAGE_SIZE}
                onClick={() => setExternalPage((page) => page + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}