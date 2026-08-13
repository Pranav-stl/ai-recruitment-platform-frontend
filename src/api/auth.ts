import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  expiresIn: number;
  id: number;
  fullName: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER";
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const registerCandidate = async (
  request: RegisterRequest
) => {
  await api.post("/auth/register/candidate", request);
};

export const registerRecruiter = async (
  request: RegisterRequest
) => {
  await api.post("/auth/register/recruiter", request);
};