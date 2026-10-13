
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Briefcase,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { getRecruiterJobs } from "../../api/jobApi";
import type { JobResponse } from "../../types/job";
import { Button } from "../../components/ui/button";

// Larger buttons so labels + icons have room
const bigBtn =
  "inline-flex items-center justify-center h-11 gap-2 rounded-xl px-5 text-sm font-medium";

function JobCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-60 animate-pulse flex-col rounded-2xl border border-foreground/80 p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="h-4 w-14 rounded bg-muted" />
      </div>

      <div className="mt-5 flex gap-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-28 rounded bg-muted" />
      </div>

      <div className="mt-5 space-y-2">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-4/5 rounded bg-muted" />
      </div>

      <div className="mt-auto flex gap-3 pt-4">
        <div className="h-11 w-24 rounded-xl bg-muted" />
        <div className="h-11 w-44 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);

    try {
      const { data } = await getRecruiterJobs();
      setJobs(data);
    } catch {
      setLoadFailed(true);
      toast.error("Failed to load your jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-foreground/80 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your job postings and track applicants.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className={`${bigBtn} w-full sm:w-auto`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Job
        </Link>
      </div>

      {/* Summary + refresh */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {loading && jobs.length === 0 ? (
            <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted align-middle" />
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {jobs.length}
              </span>{" "}
              {jobs.length === 1 ? "job" : "jobs"} posted
            </>
          )}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadJobs()}
          disabled={loading}
          aria-label="Refresh jobs"
          className="h-10 gap-2 rounded-xl px-4 text-sm"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div
          className="grid gap-5 md:grid-cols-2"
          aria-busy="true"
        >
          {[1, 2, 3, 4].map((item) => (
            <JobCardSkeleton key={item} />
          ))}
        </div>
      ) : loadFailed ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-300 px-6 py-14 text-center"
        >
          <div className="rounded-xl bg-red-50 p-3">
            <AlertCircle
              className="h-6 w-6 text-red-500"
              aria-hidden="true"
            />
          </div>

          <h2 className="text-lg font-semibold">
            Couldn't load your jobs
          </h2>

          <p className="max-w-sm text-sm text-muted-foreground">
            Something went wrong while fetching your job postings. Use Refresh
            to try again.
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-foreground/80 px-6 py-16 text-center">
          <div className="rounded-xl bg-blue-50 p-3.5">
            <Briefcase
              className="h-7 w-7 text-blue-500"
              aria-hidden="true"
            />
          </div>

          <h2 className="text-lg font-semibold">No jobs posted yet</h2>

          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first job listing to start receiving applications from
            matched candidates.
          </p>

          <Link
            to="/recruiter/jobs/create"
            className={`${bigBtn} mt-2`}
          >
            Create your first job
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {jobs.map((job) => (
            <li key={job.id} className="flex">
              <article className="flex w-full flex-col rounded-2xl border border-foreground/80 p-6 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-semibold leading-snug">
                      {job.title}
                    </h2>

                    <p className="mt-1 break-words text-sm text-muted-foreground">
                      {job.company}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-xs font-semibold uppercase tracking-wide ${
                      job.active
                        ? "text-emerald-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {job.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {job.location || "Location not specified"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {job.experience} years experience
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">
                  {job.description}
                </p>

                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                  <Link
                    to="/recruiter/applicants"
                    aria-label={`View applicants for ${job.title}`}
                    className={bigBtn}
                  >
                    <Users className="h-4 w-4" aria-hidden="true" />
                    View Applicants
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
