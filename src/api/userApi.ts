import api from "./axios";
import type { UserRequest, UserResponse } from "../types/user";

export const getUsers = () =>
  api.get<UserResponse[]>("/users");

export const getUser = (id: number) =>
  api.get<UserResponse>(`/users/${id}`);

export const createUser = (user: UserRequest) =>
  api.post<UserResponse>("/users", user);

export const updateUser = (
  id: number,
  user: UserRequest
) =>
  api.put<UserResponse>(
    `/users/${id}`,
    user
  );

export const deleteUser = (id: number) =>
  api.delete(`/users/${id}`);

export const getCurrentUser = () =>
    api.get<UserResponse>("/users/me");

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phone: string;
}

export const updateCurrentProfile = (
  data: UpdateProfileRequest
) =>
  api.put<UserResponse>("/users/me/profile", data);