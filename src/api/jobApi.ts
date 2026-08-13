import api from "./axios";
import type { JobRequest, JobResponse} from "../types/job";

export const getJobs = () =>
  api.get<JobResponse[]>("/jobs");

export const getJob = (id: number) =>
  api.get<JobResponse>(`/jobs/${id}`);

export const createJob = (job: JobRequest) =>
  api.post<JobResponse>("/jobs", job);

export const updateJob = (
  id: number,
  job: JobRequest
) => api.put<JobResponse>(`/jobs/${id}`, job);

export const deleteJob = (id: number) =>
  api.delete(`/jobs/${id}`);

export const getRecruiterJobs = () =>
  api.get<JobResponse[]>("/jobs/my");