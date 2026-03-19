"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { FolderPlus, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const budgetOptions = [
  { value: "$1k-3k", label: "$1k – $3k" },
  { value: "$3k-6k", label: "$3k – $6k" },
  { value: "$6k-12k", label: "$6k – $12k" },
  { value: "$12k+", label: "$12k+" },
  { value: "Not sure", label: "Not sure" },
];

const timelineOptions = [
  { value: "ASAP", label: "ASAP" },
  { value: "1-3 months", label: "1–3 months" },
  { value: "3-6 months", label: "3–6 months" },
  { value: "Flexible", label: "Flexible" },
];

const statusVariant: Record<string, "info" | "warning" | "success" | "destructive" | "default"> = {
  PENDING: "warning",
  REVIEWED: "info",
  CONVERTED: "success",
  DECLINED: "destructive",
};

interface ProjectRequest {
  id: string;
  name: string;
  description: string;
  budgetRange?: string;
  timeline?: string;
  additionalInfo?: string;
  status: string;
  createdAt: string;
}

export default function RequestProjectPage() {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const fetchRequests = useCallback(async () => {
    const res = await fetch("/api/portal/project-requests");
    if (res.ok) setRequests(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/project-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, budgetRange, timeline, additionalInfo }),
      });
      if (res.ok) {
        setSubmitted(true);
        setName("");
        setDescription("");
        setBudgetRange("");
        setTimeline("");
        setAdditionalInfo("");
        toast.success("Project request submitted!");
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to submit request");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Request a Project</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us about your next project and we&apos;ll get back to you with a proposal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <FolderPlus className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-xl">New Project Request</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">Request submitted successfully!</p>
                  <p className="text-xs text-emerald-400/70 mt-1">We&apos;ll review it and get back to you shortly.</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => setSubmitted(false)}>
                  Submit Another
                </Button>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground mb-2">Want to discuss your project?</p>
                <p className="text-xs text-muted-foreground mb-3">Book a free discovery call so we can understand your needs and walk you through next steps.</p>
                <a
                  href="https://cal.com/emiledutoit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Book a Discovery Call
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="req-name">Project Name</Label>
                <Input id="req-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Online Booking System" className="font-sans text-[15px]" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="req-desc">What do you need?</Label>
                <Textarea id="req-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the project, what problems it should solve, and any features you have in mind..." rows={4} className="font-sans text-[15px]" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Budget Range</Label>
                  <Select value={budgetRange} onValueChange={(v) => setBudgetRange(v ?? "")}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select a range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Timeline</Label>
                  <Select value={timeline} onValueChange={(v) => setTimeline(v ?? "")}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="When do you need it?" />
                    </SelectTrigger>
                    <SelectContent>
                      {timelineOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="req-info">Additional Info (optional)</Label>
                <Textarea id="req-info" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Links, references, examples, or anything else that would help us understand your vision..." rows={3} className="font-sans text-[15px]" />
              </div>
              <Button type="submit" disabled={submitting || !name || !description} className="w-full sm:w-auto">
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Previous Requests */}
      {!loading && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Your Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-white/5 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{req.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{req.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {req.budgetRange && `${req.budgetRange} · `}
                    {req.timeline && `${req.timeline} · `}
                    {format(new Date(req.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <StatusBadge label={req.status} variant={statusVariant[req.status] ?? "default"} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
