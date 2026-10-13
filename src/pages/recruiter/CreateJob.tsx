import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Briefcase, Plus, X, FileText, Send } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { createJob } from "../../api/jobApi";
import { useAuth } from "../../auth/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { JobRequest } from "../../types/job";

interface JobFormData {
  title: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  description: string;

  minimumMatchScore: string;
  autoScreening: boolean;
}

const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead"];

const INITIAL_FORM: JobFormData = {
  title: "",
  company: "",
  location: "",
  experience: "",
  salary: "",
  description: "",

  minimumMatchScore: "70",
  autoScreening: false,
};

type SubmitStatus = { type: "draft" | "published"; message: string } | null;

export default function CreateJob() {
  const [formData, setFormData] = useState<JobFormData>(INITIAL_FORM);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [status, setStatus] = useState<SubmitStatus>(null);
  const { user } = useAuth();
const navigate = useNavigate();

const EXPERIENCE_MAP: Record<string, number> = {
  Entry: 0,
  Mid: 2,
  Senior: 5,
  Lead: 8,
};

  function updateField<K extends keyof JobFormData>(field: K, value: JobFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill() {
    const value = skillInput.trim();
    if (value.length === 0) return;
    if (!skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setSkills((prev) => [...prev, value]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((item) => item !== skill));
  }

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!user) {
    toast.error("Please login again.");
    return;
  }

  try {
    const request: JobRequest = {
      title: formData.title,
      description: formData.description,
      company: formData.company,
      location: formData.location,
      salary: Number(formData.salary),
      requiredSkills: skills.join(", "),
      experience: EXPERIENCE_MAP[formData.experience],
      
      active: true,
      minimumMatchScore: Number(formData.minimumMatchScore),
      autoScreening: formData.autoScreening,
      recruiterId: user.id,
    };

    console.log(request);
    await createJob(request);

    toast.success("Job created successfully.");

    navigate("/recruiter/dashboard");
  } catch (error) {
    toast.error("Failed to create job.");
  }
}

  function handleSaveDraft() {
    // Mock only — no API call.
    setStatus({
      type: "draft",
      message: `"${formData.title || "Untitled role"}" was saved as a draft (mock).`,
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Post a Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the role details below. You can save a draft and come back later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g. Java Full Stack Developer"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="e.g. Fintrack"
              value={formData.company}
              onChange={(e) => updateField("company", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. Bengaluru or Remote"
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="experience">Experience</Label>
            <Select value={formData.experience} onValueChange={(value) => updateField("experience", value ?? "")}>
              <SelectTrigger id="experience">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
  type="number"
  placeholder="Salary"
              value={formData.salary}
              onChange={(e) => updateField("salary", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

  <div className="flex flex-col gap-2">
    <Label htmlFor="minimumMatchScore">
      Minimum AI Match Score
    </Label>

    <Input
      id="minimumMatchScore"
      type="number"
      min="0"
      max="100"
      value={formData.minimumMatchScore}
      onChange={(e) =>
        updateField("minimumMatchScore", e.target.value)
      }
    />
  </div>

  <div className="flex items-center justify-between rounded-lg border p-4">
  <div>
    <Label>Automatic AI Screening</Label>
    <p className="text-sm text-muted-foreground">
      Automatically reject candidates whose AI match score is below the minimum threshold.
    </p>
  </div>

 {/* <Switch
  checked={formData.autoScreening}
  onCheckedChange={(checked) => {
    console.log("Switch changed:", checked);

    setFormData((prev) => ({
      ...prev,
      autoScreening: checked,
    }));
  }}
/> */}

<input
  type="checkbox"
  checked={formData.autoScreening}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      autoScreening: e.target.checked,
    }))
  }
/>
</div>
</div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="skills">Required Skills</Label>
          <div className="flex gap-2">
            <Input
              id="skills"
              placeholder="Type a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
            />
            <Button type="button" variant="outline" size="icon" onClick={addSkill} aria-label="Add skill">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 pr-1 font-normal">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the role, responsibilities, and what a strong candidate looks like..."
            className="min-h-32 resize-y"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        {status && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
            <Briefcase className="h-4 w-4 shrink-0" />
            {status.message}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="gap-1.5" onClick={handleSaveDraft}>
            <FileText className="h-4 w-4" />
            Save Draft
          </Button>
          <Button type="submit" className="gap-1.5">
            <Send className="h-4 w-4" />
            Publish Job
          </Button>
        </div>
      </form>
    </div>
  );
}