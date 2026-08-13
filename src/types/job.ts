export interface JobRequest {
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  requiredSkills: string;
  experience: number;
  active: boolean;
    minimumMatchScore: number;
  autoScreening: boolean;
  recruiterId: number;
}

export interface JobResponse {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  requiredSkills: string;
  experience: number;
  active: boolean;
    minimumMatchScore: number;
  autoScreening: boolean;
  recruiterId: number;

}