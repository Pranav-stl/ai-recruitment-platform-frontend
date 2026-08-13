import api from "./axios";
import type { ResumeResponse } from "../types/resume";

export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<ResumeResponse>(
    "/api/resumes/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const getResume = (id: number) =>
  api.get<ResumeResponse>(`/api/resumes/${id}`);

export const getAllResumes = () =>
  api.get<ResumeResponse[]>("/api/resumes");

export const deleteResume = (id: number) =>
  api.delete(`/api/resumes/${id}`);

export const getMyResume = () =>
  api.get<ResumeResponse>("/api/resumes/me");

export const downloadResume = (resumeId: number) =>
  api.get(`/api/resumes/${resumeId}/download`, {
    responseType: "blob",
  });