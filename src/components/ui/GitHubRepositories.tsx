
import { useEffect, useState } from "react";
import api from "../../api/axios";

interface GitHubRepository {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  htmlUrl: string;
  stars: number;
  forks: number;
}

interface GitHubEvidence {
  jobId: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  relevantRepositories: GitHubRepository[];
}

interface GitHubRepositoriesProps {
  jobId?: number;
}

export default function GitHubRepositories({
  jobId,
}: GitHubRepositoriesProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [evidence, setEvidence] = useState<GitHubEvidence | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");

  // Fetch the candidate's GitHub repositories.
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setError("");

        const response = await api.get<GitHubRepository[]>(
          "/api/github/repos"
        );

        setRepositories(response.data);
      } catch (err) {
        console.error("Failed to fetch GitHub repositories:", err);
        setError("Unable to load GitHub repositories.");
      } finally {
        setLoading(false);
      }
    };

    void fetchRepositories();
  }, []);

  // Fetch evidence only when a valid job ID is supplied.
  useEffect(() => {
    if (jobId == null) {
      setEvidence(null);
      setEvidenceError("");
      setEvidenceLoading(false);
      return;
    }

    let cancelled = false;

    const fetchEvidence = async () => {
      try {
        setEvidenceLoading(true);
        setEvidenceError("");
        setEvidence(null);

        const response = await api.get<GitHubEvidence>(
          `/api/github/evidence/${jobId}`
        );

        if (!cancelled) {
          setEvidence(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch GitHub evidence:", err);
          setEvidenceError("Unable to load GitHub evidence.");
        }
      } finally {
        if (!cancelled) {
          setEvidenceLoading(false);
        }
      }
    };

    void fetchEvidence();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (loading) {
    return <p>Loading GitHub repositories...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="space-y-4">
      <h2>GitHub Repositories</h2>

      {repositories.length === 0 ? (
        <p>No public repositories found.</p>
      ) : (
        repositories.map((repo) => (
          <div key={repo.htmlUrl}>
            <h3>{repo.name}</h3>

            <p>{repo.description || "No description available"}</p>

            <p>Language: {repo.language || "Not specified"}</p>

            <p>
              ⭐ {repo.stars} &nbsp; | &nbsp; Forks: {repo.forks}
            </p>

            {repo.topics.length > 0 && (
              <p>Topics: {repo.topics.join(", ")}</p>
            )}

            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        ))
      )}

      {jobId == null ? (
        <p>Select a job to view GitHub evidence for that job.</p>
      ) : (
        <div>
          {evidenceLoading && <p>Loading GitHub evidence...</p>}

          {evidenceError && <p>{evidenceError}</p>}

          {evidence && (
            <div>
              <h2>GitHub Evidence</h2>

              <h3>Required Skills</h3>
              <p>{evidence.requiredSkills.join(", ") || "None"}</p>

              <h3>Matched Skills</h3>
              <p>{evidence.matchedSkills.join(", ") || "None"}</p>

              <h3>Missing Skills</h3>
              <p>{evidence.missingSkills.join(", ") || "None"}</p>

              <h3>Relevant Repositories</h3>

              {evidence.relevantRepositories.length === 0 ? (
                <p>No relevant repositories found.</p>
              ) : (
                evidence.relevantRepositories.map((repo) => (
                  <div key={repo.htmlUrl}>
                    <strong>{repo.name}</strong>
                    <p>
                      {repo.description || "No description available"}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
