import { Sparkles } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { getApplicationsByUser } from "../../api/applicationApi";
import type { ApplicationResponse } from "../../types/application";
import { useNavigate } from "react-router-dom";



function statusBadgeClasses(status: string) {
  switch (status) {
    case "SHORTLISTED":
      return "bg-primary/10 text-primary border-primary/20";

    case "REVIEWED":
      return "bg-sky-500/10 text-sky-600 border-sky-500/20";

    case "APPLIED":
      return "bg-muted text-muted-foreground border-border";

    case "REJECTED":
      return "bg-destructive/10 text-destructive border-destructive/20";

    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function matchBadgeClasses(score: number) {
  if (score >= 85) return "bg-primary/10 text-primary border-primary/20";
  if (score >= 70) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function ApplicationHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

const [applications, setApplications] = useState<ApplicationResponse[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user) return;

  const loadApplications = async () => {
    try {
      const response = await getApplicationsByUser();
        console.log(response);
    console.log(response.data);
      setApplications(response.data);
    } finally {
      setLoading(false);
    }
  };

  loadApplications();
}, [user]);

if (loading) {
  return <p>Loading applications...</p>;
}
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Application History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of every role you've applied to.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[180px]">Job</TableHead>
                <TableHead className="min-w-[140px]">Company</TableHead>
                <TableHead className="min-w-[150px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Applied Date</TableHead>
                <TableHead className="min-w-[130px]">AI Match Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.jobTitle}</TableCell>
                  <TableCell className="text-muted-foreground">{application.company}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("whitespace-nowrap font-normal", statusBadgeClasses(application.status))}
                    >
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(application.appliedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("gap-1 whitespace-nowrap font-normal", matchBadgeClasses(application.matchScore ?? 0))}
                    >
                      <Sparkles className="h-3 w-3" />
                      {application.matchScore}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
    variant="outline"
    size="sm"
    onClick={() =>
        navigate(`/candidate/match-analysis/${application.id}`)
    }
>
    View Details
</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}