import api from "./axios";
import type {
  ApplicationRequest,
  ApplicationResponse,
  JobMatchResponse, 
  RecruiterDashboard,
  RecruiterApplicationResponse
} from "../types/application";

export const applyForJob = (
  application: ApplicationRequest
) =>
  api.post<ApplicationResponse>(
    "/api/applications",
    application
  );

export const getApplications = () =>
  api.get<ApplicationResponse[]>("/api/applications");

export const getApplicationsByUser = (
) =>
  api.get<ApplicationResponse[]>("/api/applications/me");

export const getApplicationsByJob = (
  jobId: number
) =>
  api.get<ApplicationResponse[]>(
    `/api/applications/job/${jobId}`
  );

export const updateApplicationStatus = (
  applicationId: number,
  status: string
) =>
  api.put<ApplicationResponse>(
    `/api/applications/${applicationId}/status`,
    null,
    {
      params: { status },
    }
  );

export const matchApplication = (applicationId: number) =>
  api.post<JobMatchResponse>(
    `/api/applications/${applicationId}/match`
  );

export const getRecruiterDashboard = () =>
  api.get<RecruiterDashboard>(
    "/api/applications/recruiter/dashboard"
  );

  export const getRecruiterApplications = (jobId: number) =>
  api.get<RecruiterApplicationResponse[]>(
    `/api/applications/recruiter/job/${jobId}`
  );

  export const getRecruiterApplicationsByJob = (jobId: number) =>
  api.get<RecruiterApplicationResponse[]>(
    `/api/applications/recruiter/job/${jobId}`
  );