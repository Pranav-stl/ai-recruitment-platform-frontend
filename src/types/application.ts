export interface ApplicationRequest {
  userId: number;
  jobId: number;
  resumeId: number;
}

export interface ApplicationResponse {
  id: number;
  userId: number;
  jobId: number;
  resumeId: number;
  status: string;
  appliedAt: string;
  matchScore: number | null;
  matchingSkills: string;
  missingSkills: string;
  recommendedCourses: string;
  jobTitle : string;
  company: string
  resumeSummary: string;
  combinedScore: number | null;
analysis: string;
}

export interface CourseRecommendation {
  skill: string;
  course: string;
  provider: string;
  url:string;
  reason: string;
}

export interface JobMatchResponse {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendedCourses: CourseRecommendation[];

  resumeSummary: string;
  jobSummary: string;
  analysis: string;
}

export interface RecruiterDashboard {
  totalJobs: number;
  totalApplications: number;
  reviewedApplications: number;
  shortlistedApplications: number;
  rejectedApplications: number;
  averageMatchScore: number;
}

export interface RecruiterApplicationResponse {
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  resumeId: number;
  status: string;
  matchScore: number;
combinedScore: number | null;
  resumeSummary: string;
  analysis: string;

  matchingSkills: string;
  missingSkills: string;
  recommendedCourses: string;
}