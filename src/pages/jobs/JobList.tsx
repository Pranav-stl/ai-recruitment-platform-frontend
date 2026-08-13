import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Clock,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
const EXPERIENCE_LEVELS = ["All Levels", "Entry", "Mid", "Senior", "Lead"];
const PAGE_SIZE = 6;

function matchBadgeClasses(score: number) {
  if (score >= 85) return "bg-primary/10 text-primary border-primary/20";
  if (score >= 70) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border";
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
      location === "All Locations" ||
      job.location === location;

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

 if (loadingInternal && jobSource === "internal") {
    return <p>Loading jobs...</p>;
}

if (error) {
  return <p>{error}</p>;
}
  return (
  <div className="mx-auto flex max-w-6xl flex-col gap-6">
    <div>
  <h1 className="text-2xl font-semibold tracking-tight">
    Jobs
  </h1>

  <p className="mt-1 text-sm text-muted-foreground">
  {jobSource === "internal"
    ? `${filteredJobs.length} open role${filteredJobs.length === 1 ? "" : "s"} matched to your profile`
    : `${externalJobs.length} AI recommended external job${externalJobs.length === 1 ? "" : "s"} found`}
</p>

  {/* Job Source Toggle */}
  <div className="mt-4 flex gap-2">
    <div className="flex flex-wrap gap-2">
  <Button
    variant={jobSource === "internal" ? "default" : "outline"}
    onClick={() => setJobSource("internal")}
  >
    Internal Jobs ({filteredJobs.length})
  </Button>

  <Button
    variant={jobSource === "external" ? "default" : "outline"}
    onClick={() => setJobSource("external")}
  >
    AI Recommended ({externalJobs.length})
  </Button>
</div>
  </div>
</div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder={
    jobSource === "internal"
      ? "Search by title, company or skill"
      : "Search external jobs (min. 3 characters)"
  }
  className="pl-9"
/>
        </div>

        <select
  value={location}
  onChange={(e) => setLocation(e.target.value)}
  className="h-10 rounded-md border border-input bg-background px-3"
>
  <option>All Locations</option>
  <option>Bengaluru</option>
  <option>Hyderabad</option>
  <option>Pune</option>
  <option>Remote</option>
</select>

        <select
  value={experience}
onChange={(e) => setExperience(e.target.value)}
  className="h-10 rounded-md border border-input bg-background px-3"
>
  <option value="">All Experience</option>
  <option value="0-2">2 Years</option>
  <option value="2-5">5 Years</option>
  <option value="5-8">8 Years</option>
  <option value="8+">8+ Years</option>
</select>
      </div>

      {/* Job cards */}
      {jobSource === "internal" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginatedJobs.map((job) => (
            <div
  key={job.id}
  className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3
  className="line-clamp-2 text-base font-semibold transition-colors group-hover:text-primary"
  title={job.title}
>
  {job.title}
</h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
  <Building2 className="h-4 w-4" />
  {job.company}
</p>
                  </div>
                </div>

                <Badge variant="outline">
                  Open
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.experience}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Recently Posted
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
  {job.requiredSkills.split(",").map((skill) => (
    <Badge
      key={skill.trim()}
      variant="secondary"
      className="font-normal"
    >
      {skill.trim()}
    </Badge>
  ))}
</div>

              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-sm font-medium">₹{job.salary.toLocaleString()}</span>
                <Button
  size="sm"
  variant="outline"
  onClick={() => navigate(`/jobs/${job.id}`)}
>
  View Details
</Button>
              </div>
            </div>
          ))}
        </div>
        ) : loadingExternal ? (
  <div className="flex items-center justify-center py-16">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
      ) : externalJobs.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <h3 className="text-lg font-semibold">No external jobs found</h3>
    <p className="mt-2 text-muted-foreground">
      Try changing the keyword or location and search again.
    </p>
  </div>
) :(
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {externalJobs.map((job) => (
      <div
        key={job.id}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              {job.title}
            </h3>

            <p className="text-xs text-muted-foreground">
              {job.company}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
  <Badge variant="outline" className="flex items-center gap-1">
    <MapPin className="h-3 w-3" />
    {job.location || "Location not specified"}
  </Badge>
</div>

        <p className="min-h-[80px] line-clamp-4 text-sm text-muted-foreground">
  {job.description || "No description available."}
</p>

        <div className="mt-auto flex items-center justify-between">
          <Badge variant="secondary" className="font-medium">
  {job.salary || "Salary Not Disclosed"}
</Badge>

        <Button
  className="w-full"
  disabled={!job.redirectUrl}
  onClick={() => {
    if (job.redirectUrl) {
      window.open(job.redirectUrl, "_blank", "noopener,noreferrer");
    }
  }}
>
  {job.redirectUrl ? "Apply on Adzuna" : "Application Unavailable"}
</Button>
        </div>
      </div>
    ))}
  </div>
)}

      {jobSource === "internal" ? (
  filteredJobs.length > 0 && (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <p className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((page) => Math.max(1, page - 1))
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <Button
            key={page}
            variant={
              page === currentPage
                ? "default"
                : "outline"
            }
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((page) =>
              Math.min(totalPages, page + 1)
            )
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
) : (
  <div className="flex items-center justify-between border-t border-border pt-4">

   <p className="text-xs text-muted-foreground">
  Page {externalPage}
  {externalJobs.length > 0 && ` • Showing ${externalJobs.length} jobs`}
</p>

    <div className="flex gap-2">

      <Button
        variant="outline"
        disabled={externalPage === 1}
        onClick={() =>
          setExternalPage((page) =>
            Math.max(1, page - 1)
          )
        }
      >
        Previous
      </Button>

     <Button
  variant="outline"
  disabled={externalJobs.length < PAGE_SIZE}
  onClick={() => setExternalPage((page) => page + 1)}
>
  Next
</Button>

    </div>

  </div>
)}
</div>
  );
}
    
