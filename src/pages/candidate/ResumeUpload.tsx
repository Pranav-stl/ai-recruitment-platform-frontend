import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud, FileText, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { useEffect } from "react";
import { uploadResume, getMyResume } from "../../api/resumeApi";
import type { ResumeResponse } from "../../types/resume";
import { useAuth } from "../../auth/useAuth";

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE_MB = 5;






function hasAcceptedExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export default function ResumeUpload() {
  const { user } = useAuth();
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
const [uploading, setUploading] = useState(false);
const [error, setError] = useState("");



  async function processFile(file: File) {
    console.log("User:", user);
console.log("File:", File);
console.log("Calling upload...");
  if (!hasAcceptedExtension(file.name)) {
    setError("Unsupported file type. Please upload a PDF, DOC, or DOCX file.");
    return;
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
    return;
  }

  try {
    setUploading(true);
    setError("");

    await uploadResume(file);

    const response = await getMyResume();

    setResume(response.data);
  } catch (err) {
    console.error(err);
    setError("Resume upload failed.");
  } finally {
    setUploading(false);
  }
}

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
    event.target.value = "";
  }

  function openFileDialog() {
    inputRef.current?.click();
  }

  useEffect(() => {
  const fetchResume = async () => {
    try {
      if (!user) return;
      const response = await getMyResume();
      setResume(response.data);
    } catch (err: any) {
  if (err?.response?.status !== 404) {
    console.error(err);
    setError("Failed to load resume.");
  }
} finally {
      setLoading(false);
    }
  };

  fetchResume();
}, [user]);

if (loading) {
  return <p>Loading resume...</p>;
}
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your resume so recruiters and the AI match engine can review it.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Drag & drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") openFileDialog();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UploadCloud className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Drag & drop your resume here</p>
          <p className="mt-1 text-xs text-muted-foreground">or click to browse from your device</p>
        </div>
        <Button
          disabled={uploading}
          type="button"
          size="sm"
          className="mt-1 gap-1.5"
          onClick={(event) => {
            event.stopPropagation();
            openFileDialog();
          }}
        >
          <UploadCloud className="h-4 w-4" />
{uploading ? "Uploading..." : "Upload Resume"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Accepted formats: PDF, DOC, DOCX · Max {MAX_SIZE_MB}MB
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Resume information card */}
      {resume ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{resume.fileName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Resume uploaded successfully
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/10 font-normal text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </Badge>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={openFileDialog}>
              <RefreshCw className="h-3.5 w-3.5" />
              Replace Resume
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm font-medium">No resume uploaded yet</p>
          <p className="text-xs text-muted-foreground">Upload a resume to get matched with jobs.</p>
        </div>
      )}
    </div>
  );
}