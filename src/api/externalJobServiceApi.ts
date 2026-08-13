import api from "../api/axios";
import type { ExternalJobResponse } from "../types/externalJob";

export const getExternalJobs = (
  keyword: string,
  location: string,
  page: number
) => {
  return api.get<ExternalJobResponse[]>("/external-jobs", {
    params: {
      keyword,
      location,
      page,
    },
  });
};

export const getRecommendedExternalJobs = () => {
  return api.get<ExternalJobResponse[]>("/external-jobs/recommended");
};