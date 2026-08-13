import api from "./axios";
import type { ExternalJobResponse } from "../types/externalJob";

export const getExternalJobs = (
  keyword = "",
  location = "",
  page = 1
) =>
  api.get<ExternalJobResponse[]>("/api/external-jobs", {
    params: {
      keyword,
      location,
      page,
    },
  });

  export const getRecommendedExternalJobs = () =>
  api.get<ExternalJobResponse[]>("/external-jobs/recommended");