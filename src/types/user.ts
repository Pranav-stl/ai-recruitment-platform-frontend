export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";

export interface UserRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  phone: string;
}