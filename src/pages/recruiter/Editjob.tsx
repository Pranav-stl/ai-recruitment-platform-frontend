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

interface JobFormData {
  title: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  description: string;
}

const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead"];

// Mock prefilled data — stands in for a job fetched by id (no API wired up yet).
const MOCK_JOB: JobFormData = {
  title: "Java Full Stack Developer",
  company: "Fintrack",
  location: "Pune, India",
  experience: "Entry",
  salary: "₹9–13 LPA",
  description:
    "Fintrack is looking for a Java Full Stack Developer to help build and scale our core payments dashboard. You'll work closely with backend, frontend, and product teams to ship features end-to-end.",
};

const MOCK_SKILLS: string[] = ["Java", "Spring Boot", "React", "MySQL", "REST APIs", "Git"];

type SubmitStatus = { type: "draft" | "updated"; message: string } | null;

export default function EditJob() {
  const [formData, setFormData] = useState<JobFormData>(MOCK_JOB);
  const [skills, setSkills] = useState<string[]>(MOCK_SKILLS);
  const [skillInput, setSkillInput] = useState("");
  const [status, setStatus] = useState<SubmitStatus>(null);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Mock only — no API call. Wire this up to your backend later.
    setStatus({
      type: "updated",
      message: `"${formData.title || "Untitled role"}" was updated (mock).`,
    });
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
        <h1 className="text-2xl font-semibold tracking-tight">Edit Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the role details below. Changes aren't saved until you publish an update.
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
              placeholder="e.g. ₹12–18 LPA"
              value={formData.salary}
              onChange={(e) => updateField("salary", e.target.value)}
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
            Update Job
          </Button>
        </div>
      </form>
    </div>
  );
}