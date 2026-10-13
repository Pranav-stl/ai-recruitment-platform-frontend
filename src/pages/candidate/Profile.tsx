import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Pencil,
  Calendar,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/userApi";
import type { UserResponse } from "../../types/user";
import { getMyResume } from "../../api/resumeApi";
import type { ResumeResponse } from "../../types/resume";



interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  duration: string;
}





const MOCK_EDUCATION: EducationEntry[] = [
  {
    id: "edu-1",
    degree: "B.E. in Computer Science & Engineering",
    institution: "Sai Vidya Institute of Technology (VTU), Bengaluru",
    duration: "2022 – 2026",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Profile() {
  const [profile, setProfile] = useState<UserResponse | null>(null);
const [loading, setLoading] = useState(true);
const [resume, setResume] = useState<ResumeResponse | null>(null);

useEffect(() => {
  const loadProfile = async () => {
  try {
    const response = await getCurrentUser();
    setProfile(response.data);

    try {
      const resumeResponse = await getMyResume();
      setResume(resumeResponse.data);
    } catch {
      setResume(null);
    }

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  loadProfile();
}, []);

if (loading) {
  return <div>Loading...</div>;
}

if (!profile) {
  return <div>Unable to load profile.</div>;
}

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the information visible to recruiters and the AI match engine.
          </p>
        </div>
        <Button variant="outline" className="gap-1.5">
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Personal Information</h2>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
              {initials(profile.fullName)}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-base font-semibold leading-tight">{profile.fullName}</p>
            <p className="text-sm text-muted-foreground">Candidate</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            {profile.email}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            {profile.phone || "Not provided"}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            Not specified
          </span>
        </div>
      </div>

      {/* Resume Information */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{resume?.fileName ?? "No resume uploaded"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {resume
    ? `Uploaded ${new Date(resume.uploadedAt).toLocaleDateString()}`
    : "Upload a resume to enable AI matching"}
            </p>
          </div>
        </div>
       <Badge
  variant="outline"
  className={`w-fit font-normal ${
    resume
      ? "border-primary/20 bg-primary/10 text-primary"
      : "border-destructive/20 bg-destructive/10 text-destructive"
  }`}
>
  {resume ? "Resume Uploaded" : "No Resume"}
</Badge>
      </div>

      {/* Skills */}
     <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
  <h2 className="text-base font-semibold">Skills</h2>

  <p className="mt-3 text-sm text-muted-foreground">
    Skills will be generated automatically from your uploaded resume after AI processing.
  </p>
</div>

     <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
  <h2 className="text-base font-semibold">Account Information</h2>

  <div className="mt-4 space-y-3 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Role</span>
      <Badge>{profile.role}</Badge>
    </div>

    <div className="flex justify-between">
      <span className="text-muted-foreground">Email</span>
      <span>{profile.email}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-muted-foreground">Phone</span>
      <span>{profile.phone || "Not provided"}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-muted-foreground">Resume Status</span>
      <Badge variant={resume ? "default" : "destructive"}>
        {resume ? "Uploaded" : "Not Uploaded"}
      </Badge>
    </div>
  </div>
</div>

        <div className="mt-4 flex flex-col gap-4">
          {MOCK_EDUCATION.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-1 border-l-2 border-border pl-4">
              <p className="text-sm font-medium leading-tight">{entry.degree}</p>
              <p className="text-xs text-muted-foreground">{entry.institution}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {entry.duration}
              </p>
            </div>
          ))}
        </div>
      </div>
    
  );
}