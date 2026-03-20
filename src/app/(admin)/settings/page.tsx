"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  RotateCcw,
  Save,
  Plus,
  X,
  Database,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  UploadCloud,
  Mail,
  ChevronDown,
  Headphones,
} from "lucide-react";
import Image from "next/image";
import type { AthenaConfig } from "@/lib/athena-config";
import type { EmailConfig } from "@/lib/email-config";
import type { BackupConfig } from "@/lib/backup-config";
import type { SupportConfig } from "@/lib/support-config";
import type { BackupEntry } from "@/lib/backup";
import { HelpButton } from "@/components/shared/help-modal";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

interface BackupList {
  daily: BackupEntry[];
  weekly: BackupEntry[];
  monthly: BackupEntry[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function tierBadge(tier: BackupEntry["tier"]) {
  const map = {
    daily: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    weekly: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    monthly: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  } as const;
  return (
    <span className={`rounded border px-2 py-0.5 text-xs font-medium ${map[tier]}`}>
      {tier}
    </span>
  );
}

function BackupTable({ entries, onRestore }: { entries: BackupEntry[]; onRestore: (url: string, label: string) => void }) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No backups yet. Run a backup to see entries here.
      </p>
    );
  }
  return (
    <div className="divide-y divide-border">
      {entries.map((entry) => (
        <div
          key={entry.pathname}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {tierBadge(entry.tier)}
            <span className="font-notes text-sm">{entry.label}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatBytes(entry.size)}</span>
            <span className="hidden sm:inline">{formatDate(entry.uploadedAt)}</span>
          </div>
          <div className="flex gap-1">
            <ActionTooltip label="Restore from this backup">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-500"
                onClick={() => onRestore(entry.url, entry.label)}
              >
                <UploadCloud className="h-3.5 w-3.5" />
              </Button>
            </ActionTooltip>
            <ActionTooltip label="Download backup JSON">
              <a
                href={entry.url}
                download={`${entry.label}.json`}
                title={`Download ${entry.label}.json`}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </a>
            </ActionTooltip>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  // Section collapse state
  const [athenaOpen, setAthenaOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [backupsOpen, setBackupsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [config, setConfig] = useState<AthenaConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newModel, setNewModel] = useState("");

  // Email config state
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  // Backup config state
  const [backupConfig, setBackupConfig] = useState<BackupConfig | null>(null);
  const [backupSaving, setBackupSaving] = useState(false);
  const [backupSaved, setBackupSaved] = useState(false);

  // Support config state
  const [supportConfig, setSupportConfig] = useState<SupportConfig | null>(null);
  const [supportSaving, setSupportSaving] = useState(false);
  const [supportSaved, setSupportSaved] = useState(false);

  // Backup state
  const [backups, setBackups] = useState<BackupList | null>(null);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupResult, setBackupResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/athena/config")
      .then((r) => r.json())
      .then(setConfig);
    fetch("/api/email/config")
      .then((r) => r.json())
      .then(setEmailConfig);
    fetch("/api/backup/config")
      .then((r) => r.json())
      .then(setBackupConfig);
    fetch("/api/support/config")
      .then((r) => r.json())
      .then(setSupportConfig);
  }, []);

  const loadBackups = useCallback(async () => {
    setBackupsLoading(true);
    try {
      const res = await fetch("/api/admin/backup/list");
      if (res.ok) setBackups(await res.json());
    } finally {
      setBackupsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/athena/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        setSaved(true);
        toast.success("Athena settings saved");
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error("Failed to save settings");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    const res = await fetch("/api/athena/config", { method: "DELETE" });
    if (res.ok) {
      const defaults = await res.json();
      setConfig(defaults);
      setSaved(true);
      toast.success("Settings reset to defaults");
      setTimeout(() => setSaved(false), 3000);
    } else {
      toast.error("Failed to reset settings");
    }
  }

  function addModel() {
    if (!config || !newModel.trim()) return;
    if (config.freeModels.includes(newModel.trim())) return;
    setConfig({ ...config, freeModels: [...config.freeModels, newModel.trim()] });
    setNewModel("");
  }

  function removeModel(model: string) {
    if (!config || config.freeModels.length <= 1) return;
    setConfig({ ...config, freeModels: config.freeModels.filter((m) => m !== model) });
  }

  async function handleEmailSave() {
    if (!emailConfig) return;
    setEmailSaving(true);
    setEmailSaved(false);
    try {
      const res = await fetch("/api/email/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailConfig),
      });
      if (res.ok) {
        setEmailConfig(await res.json());
        setEmailSaved(true);
        toast.success("Email preferences saved");
        setTimeout(() => setEmailSaved(false), 3000);
      } else {
        toast.error("Failed to save email preferences");
      }
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleEmailReset() {
    const res = await fetch("/api/email/config", { method: "DELETE" });
    if (res.ok) {
      setEmailConfig(await res.json());
      setEmailSaved(true);
      toast.success("Email preferences reset to defaults");
      setTimeout(() => setEmailSaved(false), 3000);
    }
  }

  async function handleBackupConfigSave() {
    if (!backupConfig) return;
    setBackupSaving(true);
    setBackupSaved(false);
    try {
      const res = await fetch("/api/backup/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupConfig),
      });
      if (res.ok) {
        setBackupConfig(await res.json());
        setBackupSaved(true);
        toast.success("Backup retention settings saved");
        setTimeout(() => setBackupSaved(false), 3000);
      } else {
        toast.error("Failed to save backup settings");
      }
    } finally {
      setBackupSaving(false);
    }
  }

  async function handleBackupConfigReset() {
    const res = await fetch("/api/backup/config", { method: "DELETE" });
    if (res.ok) {
      setBackupConfig(await res.json());
      toast.success("Backup retention reset to defaults");
    }
  }

  async function handleSupportSave() {
    if (!supportConfig) return;
    setSupportSaving(true);
    setSupportSaved(false);
    try {
      const res = await fetch("/api/support/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supportConfig),
      });
      if (res.ok) {
        setSupportConfig(await res.json());
        setSupportSaved(true);
        toast.success("Support defaults saved");
        setTimeout(() => setSupportSaved(false), 3000);
      } else { toast.error("Failed to save support defaults"); }
    } finally { setSupportSaving(false); }
  }

  async function handleSupportReset() {
    const res = await fetch("/api/support/config", { method: "DELETE" });
    if (res.ok) {
      setSupportConfig(await res.json());
      toast.success("Support defaults reset");
    }
  }

  async function handleBackupNow() {
    setBackupRunning(true);
    setBackupResult(null);
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json();
      setBackupResult({
        success: data.success,
        message: data.success
          ? `Backup complete — ${formatBytes(data.sizeBytes ?? 0)} in ${data.durationMs}ms${
              data.promoted?.weekly ? " · promoted to weekly" : ""
            }${data.promoted?.monthly ? " · promoted to monthly" : ""}${
              data.deleted?.length ? ` · deleted ${data.deleted.length} old backup(s)` : ""
            }`
          : `Backup failed: ${data.error}`,
      });
      if (data.success) await loadBackups();
    } finally {
      setBackupRunning(false);
    }
  }

  const confirmAction = useConfirm();
  const [restoring, setRestoring] = useState(false);

  async function handleRestore(url: string, label: string) {
    const ok = await confirmAction({
      title: "Restore Database",
      description: `This will replace ALL current data with the backup "${label}". A safety backup will be created first. This action cannot be undone.`,
      confirmLabel: "Restore",
      variant: "danger",
    });
    if (!ok) return;
    setRestoring(true);
    setBackupResult(null);
    try {
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        const summary = Object.entries(data.counts ?? {})
          .filter(([, v]) => (v as number) > 0)
          .map(([k, v]) => `${v} ${k}`)
          .join(", ");
        toast.success(`Restored in ${data.durationMs}ms — ${summary}`);
        await loadBackups();
      } else {
        toast.error(`Restore failed: ${data.error}`);
      }
    } catch {
      toast.error("Restore failed — network error");
    } finally {
      setRestoring(false);
    }
  }

  const allBackups = backups
    ? [...backups.daily, ...backups.weekly, ...backups.monthly]
    : [];
  const totalSize = allBackups.reduce((s, b) => s + b.size, 0);
  const lastBackup = allBackups.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )[0];

  if (!config) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-display">Settings</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and integrations.
        </p>
      </div>

      <Separator />

      {/* Athena Preferences */}
      <Card>
        <CardHeader className="cursor-pointer select-none" onClick={() => setAthenaOpen(!athenaOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/Athena.png"
                alt="Athena"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <CardTitle className="font-display text-2xl text-primary">
                  Athena Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure the AI assistant&apos;s behavior, personality, and limits.
                </p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${athenaOpen ? "rotate-180" : ""}`} />
          </div>
        </CardHeader>
        {athenaOpen && <CardContent className="space-y-6">
          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="text-base font-medium text-primary">
              System Prompt
            </Label>
            <p className="text-sm text-muted-foreground">
              Defines Athena&apos;s personality, knowledge, and response style.
            </p>
            <Textarea
              id="systemPrompt"
              value={config.systemPrompt}
              onChange={(e) =>
                setConfig({ ...config, systemPrompt: e.target.value })
              }
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <Separator />

          {/* Response Limits */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxTokens" className="text-base text-primary">Max Output Tokens</Label>
              <p className="text-sm text-muted-foreground">
                Caps response length. 350 ≈ 2-3 sentences.
              </p>
              <Input
                id="maxTokens"
                type="number"
                min={50}
                max={2000}
                value={config.maxOutputTokens}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxOutputTokens: parseInt(e.target.value) || 350,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-base text-primary">Temperature</Label>
              <p className="text-sm text-muted-foreground">
                0 = focused/deterministic, 2 = creative/random. Default: 0.7
              </p>
              <Input
                id="temperature"
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={config.temperature}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    temperature: parseFloat(e.target.value) || 0.7,
                  })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Free Models */}
          <div className="space-y-3">
            <Label className="text-base text-primary">Free Models (OpenRouter)</Label>
            <p className="text-sm text-muted-foreground">
              Athena cycles through these in round-robin. Models are tried in
              order; failed ones are skipped.
            </p>
            <div className="flex flex-wrap gap-2">
              {config.freeModels.map((model) => (
                <Badge
                  key={model}
                  variant="outline"
                  className="gap-1 py-1 pl-2.5 pr-1"
                >
                  <span className="text-xs">{model}</span>
                  <button
                    type="button"
                    onClick={() => removeModel(model)}
                    className="ml-1 rounded-sm p-0.5 hover:bg-destructive/20"
                    aria-label={`Remove ${model}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="model-provider/model-name:free"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addModel())}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addModel}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* OpenAI Fallback */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base text-primary">OpenAI Fallback</Label>
                <p className="text-sm text-muted-foreground">
                  Use OpenAI when all free models are unavailable.
                </p>
              </div>
              <Switch
                checked={config.enableOpenAIFallback}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, enableOpenAIFallback: checked })
                }
              />
            </div>
            {config.enableOpenAIFallback && (
              <div className="space-y-2">
                <Label htmlFor="fallbackModel" className="text-base text-primary">Fallback Model</Label>
                <Input
                  id="fallbackModel"
                  value={config.openAIFallbackModel}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      openAIFallbackModel: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>}
      </Card>

      <Separator />

      {/* Email Preferences */}
      <Card>
        <CardHeader className="cursor-pointer select-none" onClick={() => setEmailOpen(!emailOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-2xl text-primary">
                  Email Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Logo and company name used in all outgoing emails.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HelpButton sectionKey="emailPreferences" />
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${emailOpen ? "rotate-180" : ""}`} />
            </div>
          </div>
        </CardHeader>
        {emailOpen && emailConfig && (
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-company" className="text-base text-primary">Company Name</Label>
              <p className="text-sm text-muted-foreground">
                Appears in the &quot;From&quot; field and email header of all outgoing emails.
              </p>
              <Input
                id="email-company"
                value={emailConfig.companyName}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, companyName: e.target.value })
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-base text-primary">Email Logo</Label>
              <p className="text-sm text-muted-foreground">
                Upload up to 3 logos. Check the one to use in emails. Drag & drop or click to upload (max 2MB, images only).
              </p>

              {/* Drag & drop upload */}
              <div
                className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 cursor-pointer"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary");
                  const file = e.dataTransfer.files[0];
                  if (!file) return;
                  if ((emailConfig.logos?.length ?? 0) >= 3) { toast.error("Maximum 3 logos"); return; }
                  if (!file.type.startsWith("image/")) { toast.error("Must be an image"); return; }
                  if (file.size > 2 * 1024 * 1024) { toast.error("Must be under 2MB"); return; }
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/admin/logos", { method: "POST", body: fd });
                  if (res.ok) {
                    const data = await res.json();
                    const isFirst = (emailConfig.logos?.length ?? 0) === 0;
                    const newLogos = [...(emailConfig.logos ?? []), { url: data.url, name: data.name, active: isFirst }];
                    setEmailConfig({ ...emailConfig, logos: newLogos, ...(isFirst ? { logoUrl: data.url } : {}) });
                    toast.success("Logo uploaded");
                  } else {
                    const text = await res.text();
                    try { const data = JSON.parse(text); toast.error(data.error ?? "Upload failed"); } catch { toast.error("Upload failed"); }
                  }
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    if ((emailConfig.logos?.length ?? 0) >= 3) { toast.error("Maximum 3 logos"); return; }
                    if (file.size > 2 * 1024 * 1024) { toast.error("Must be under 2MB"); return; }
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/admin/logos", { method: "POST", body: fd });
                    if (res.ok) {
                      const data = await res.json();
                      const isFirst = (emailConfig.logos?.length ?? 0) === 0;
                      const newLogos = [...(emailConfig.logos ?? []), { url: data.url, name: data.name, active: isFirst }];
                      setEmailConfig({ ...emailConfig, logos: newLogos, ...(isFirst ? { logoUrl: data.url } : {}) });
                      toast.success("Logo uploaded");
                    } else {
                      const data = await res.json();
                      toast.error(data.error ?? "Upload failed");
                    }
                  };
                  input.click();
                }}
              >
                <p className="text-sm text-muted-foreground">Drop an image here or click to browse</p>
                <p className="text-xs text-muted-foreground/60">{3 - (emailConfig.logos?.length ?? 0)} slot{3 - (emailConfig.logos?.length ?? 0) !== 1 ? "s" : ""} remaining</p>
              </div>

              {/* Current active logo preview (when no uploaded logos) */}
              {(emailConfig.logos?.length ?? 0) === 0 && emailConfig.logoUrl && (
                <div className="mt-3 rounded-lg border border-primary bg-primary/10 p-4 flex items-center gap-4">
                  <img
                    src={emailConfig.logoUrl}
                    alt="Current logo"
                    style={{ maxHeight: emailConfig.logoSize, maxWidth: emailConfig.logoSize * 2 }}
                    className="object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div>
                    <p className="text-sm font-medium text-primary">Current Logo</p>
                    <p className="text-xs text-muted-foreground truncate">{emailConfig.logoUrl}</p>
                    <p className="text-[10px] text-emerald-500 mt-1">Active — used in emails</p>
                  </div>
                </div>
              )}

              {/* Logo gallery */}
              {(emailConfig.logos?.length ?? 0) > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {emailConfig.logos?.map((logo, i) => (
                    <div
                      key={logo.url}
                      className={`relative rounded-lg border p-3 text-center transition-colors ${
                        logo.active ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      <img
                        src={logo.url}
                        alt={logo.name}
                        className="mx-auto mb-2 object-contain"
                        style={{ maxHeight: 80, maxWidth: 120 }}
                      />
                      <p className="text-[10px] text-muted-foreground truncate">{logo.name}</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={logo.active}
                            className="accent-primary"
                            onChange={() => {
                              const newLogos = emailConfig.logos!.map((l, j) => ({
                                ...l,
                                active: j === i,
                              }));
                              const activeUrl = newLogos.find((l) => l.active)?.url ?? emailConfig.logoUrl;
                              setEmailConfig({ ...emailConfig, logos: newLogos, logoUrl: activeUrl });
                            }}
                          />
                          <span className={logo.active ? "text-primary" : "text-muted-foreground"}>Active</span>
                        </label>
                        <button
                          type="button"
                          className="text-xs text-destructive hover:underline cursor-pointer"
                          onClick={async () => {
                            await fetch("/api/admin/logos", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ url: logo.url }),
                            });
                            const newLogos = emailConfig.logos!.filter((_, j) => j !== i);
                            if (logo.active && newLogos.length > 0) newLogos[0].active = true;
                            const activeUrl = newLogos.find((l) => l.active)?.url ?? "/DreamForgeConsultingLogo-email.png";
                            setEmailConfig({ ...emailConfig, logos: newLogos, logoUrl: activeUrl });
                            toast.success("Logo removed");
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Size slider */}
              <div className="mt-3 flex items-center gap-4">
                <Label htmlFor="email-logo-size" className="shrink-0 text-sm text-muted-foreground">
                  Size: {emailConfig.logoSize}px
                </Label>
                <input
                  id="email-logo-size"
                  type="range"
                  min={30}
                  max={300}
                  value={emailConfig.logoSize}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, logoSize: parseInt(e.target.value) })
                  }
                  className="flex-1 accent-primary"
                  title={`Logo size: ${emailConfig.logoSize}px`}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="email-signoff" className="text-base text-primary">Sign-Off</Label>
              <p className="text-sm text-muted-foreground">
                Closing line at the bottom of outreach emails. Use separate lines for greeting and name.
              </p>
              <Textarea
                id="email-signoff"
                value={emailConfig.signOff}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, signOff: e.target.value })
                }
                rows={3}
                className="font-mono text-sm"
                placeholder={"Best regards,\nDreamForge Consulting"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-tagline" className="text-base text-primary">Tagline</Label>
              <p className="text-sm text-muted-foreground">
                Short phrase shown in the email footer after the company name.
              </p>
              <Input
                id="email-tagline"
                value={emailConfig.tagline}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, tagline: e.target.value })
                }
                placeholder="Crafting your digital future."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base text-primary">Booking URLs</Label>
              <p className="text-sm text-muted-foreground">
                Up to 2 booking URLs. The active one is used for the CTA button in outreach emails. Clear both to disable.
              </p>
              {(emailConfig.bookingUrls ?? []).map((entry, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg border p-3 ${entry.active ? "border-primary bg-primary/10" : "border-border"}`}>
                  <input
                    type="checkbox"
                    checked={entry.active}
                    className="accent-primary shrink-0"
                    title="Set as active for emails"
                    onChange={() => {
                      const updated = (emailConfig.bookingUrls ?? []).map((b, j) => ({ ...b, active: j === i }));
                      const activeUrl = updated.find((b) => b.active)?.url ?? "";
                      setEmailConfig({ ...emailConfig, bookingUrls: updated, bookingUrl: activeUrl });
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <Input
                      value={entry.label}
                      onChange={(e) => {
                        const updated = [...(emailConfig.bookingUrls ?? [])];
                        updated[i] = { ...updated[i], label: e.target.value };
                        setEmailConfig({ ...emailConfig, bookingUrls: updated });
                      }}
                      placeholder="Button label (e.g., Book a Free Discovery Call)"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={entry.url}
                      onChange={(e) => {
                        const updated = [...(emailConfig.bookingUrls ?? [])];
                        updated[i] = { ...updated[i], url: e.target.value };
                        if (updated[i].active) setEmailConfig({ ...emailConfig, bookingUrls: updated, bookingUrl: e.target.value });
                        else setEmailConfig({ ...emailConfig, bookingUrls: updated });
                      }}
                      placeholder="https://..."
                      className="h-7 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline shrink-0 cursor-pointer"
                    onClick={() => {
                      const updated = (emailConfig.bookingUrls ?? []).filter((_, j) => j !== i);
                      if (entry.active && updated.length > 0) updated[0].active = true;
                      const activeUrl = updated.find((b) => b.active)?.url ?? "";
                      setEmailConfig({ ...emailConfig, bookingUrls: updated, bookingUrl: activeUrl });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(emailConfig.bookingUrls ?? []).length < 2 && (
                <button
                  type="button"
                  className="text-sm text-primary hover:underline cursor-pointer"
                  onClick={() => {
                    const isFirst = (emailConfig.bookingUrls ?? []).length === 0;
                    const newEntry = { url: "", label: "Book a Free Discovery Call", active: isFirst };
                    const updated = [...(emailConfig.bookingUrls ?? []), newEntry];
                    setEmailConfig({ ...emailConfig, bookingUrls: updated });
                  }}
                >
                  + Add Booking URL
                </button>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-primary">Use lead name in greeting</p>
                <p className="text-xs text-muted-foreground">
                  Include the lead&apos;s name in outreach email greeting (e.g., &quot;Hi Sarah&quot;).
                </p>
              </div>
              <Switch
                checked={emailConfig.greetingUseName}
                onCheckedChange={(checked) =>
                  setEmailConfig({ ...emailConfig, greetingUseName: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-primary">Use company name in greeting</p>
                <p className="text-xs text-muted-foreground">
                  Include the company name (e.g., &quot;Hi Sarah at TechFlow Inc&quot;).
                </p>
              </div>
              <Switch
                checked={emailConfig.greetingUseCompany}
                onCheckedChange={(checked) =>
                  setEmailConfig({ ...emailConfig, greetingUseCompany: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-primary">Auto-send approval request email</p>
                <p className="text-xs text-muted-foreground">
                  When a project reaches Client Approval, automatically email the client to review and approve.
                </p>
              </div>
              <Switch
                checked={emailConfig.autoApprovalEmail}
                onCheckedChange={(checked) =>
                  setEmailConfig({ ...emailConfig, autoApprovalEmail: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Button onClick={handleEmailSave} disabled={emailSaving}>
                <Save className="mr-2 h-4 w-4" />
                {emailSaving ? "Saving..." : emailSaved ? "Saved!" : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleEmailReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Separator />

      {/* Backups & Cron */}
      <Card>
        <CardHeader className="cursor-pointer select-none" onClick={() => setBackupsOpen(!backupsOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-2xl text-primary">
                  Backups &amp; Cron
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automated daily DB snapshots stored in Vercel Blob.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HelpButton sectionKey="backups" />
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${backupsOpen ? "rotate-180" : ""}`} />
            </div>
          </div>
        </CardHeader>
        {backupsOpen && <CardContent className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Total Backups</p>
              <p className="mt-1 text-2xl font-display text-primary">
                {allBackups.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {backups?.daily.length ?? 0}d ·{" "}
                {backups?.weekly.length ?? 0}w ·{" "}
                {backups?.monthly.length ?? 0}m
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Total Storage</p>
              <p className="mt-1 text-2xl font-display text-primary">
                {formatBytes(totalSize)}
              </p>
              <p className="text-xs text-muted-foreground">max ~85 MB</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Last Backup</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {lastBackup ? formatDate(lastBackup.uploadedAt) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lastBackup ? lastBackup.label : "none yet"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Next Scheduled</p>
              <p className="mt-1 text-sm font-medium text-foreground">~2:00 AM UTC</p>
              <p className="text-xs text-muted-foreground">daily · ±59 min</p>
            </div>
          </div>

          {/* Cron info strip */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-primary">0 2 * * *</span>
            <span className="text-muted-foreground">Daily at ~2:00 AM UTC</span>
            <span className="mx-1 text-muted-foreground">·</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {backupConfig ? `${backupConfig.retainDaily} daily · ${backupConfig.retainWeekly} weekly · ${backupConfig.retainMonthly} monthly retained` : "7 daily · 4 weekly · 6 monthly retained"}
            </span>
          </div>

          {/* Manual trigger */}
          <div className="flex items-center gap-3">
            <ActionTooltip label="Trigger an immediate database backup">
              <Button
                onClick={handleBackupNow}
                disabled={backupRunning}
                variant="outline"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${backupRunning ? "animate-spin" : ""}`}
                />
                {backupRunning ? "Backing up…" : "Backup Now"}
              </Button>
            </ActionTooltip>
            <ActionTooltip label="Refresh backup list">
              <Button
                variant="ghost"
                size="icon"
                onClick={loadBackups}
                disabled={backupsLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${backupsLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </ActionTooltip>
            {backupResult && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  backupResult.success ? "text-emerald-400" : "text-destructive"
                }`}
              >
                {backupResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {backupResult.message}
              </div>
            )}
          </div>

          {/* Retention settings */}
          {backupConfig && (
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <p className="text-sm font-medium text-primary">Retention Policy</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="retain-daily" className="text-xs text-muted-foreground">Daily (days)</Label>
                  <Input
                    id="retain-daily"
                    type="number"
                    min={1}
                    max={30}
                    value={backupConfig.retainDaily}
                    onChange={(e) => setBackupConfig({ ...backupConfig, retainDaily: parseInt(e.target.value) || 7 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="retain-weekly" className="text-xs text-muted-foreground">Weekly (weeks)</Label>
                  <Input
                    id="retain-weekly"
                    type="number"
                    min={1}
                    max={12}
                    value={backupConfig.retainWeekly}
                    onChange={(e) => setBackupConfig({ ...backupConfig, retainWeekly: parseInt(e.target.value) || 4 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="retain-monthly" className="text-xs text-muted-foreground">Monthly (months)</Label>
                  <Input
                    id="retain-monthly"
                    type="number"
                    min={1}
                    max={24}
                    value={backupConfig.retainMonthly}
                    onChange={(e) => setBackupConfig({ ...backupConfig, retainMonthly: parseInt(e.target.value) || 6 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleBackupConfigSave} disabled={backupSaving}>
                  <Save className="mr-2 h-3.5 w-3.5" />
                  {backupSaving ? "Saving..." : backupSaved ? "Saved!" : "Save Retention"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleBackupConfigReset}>
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Backup list tabs */}
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">
                Daily
                {backups && (
                  <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                    {backups.daily.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="weekly">
                Weekly
                {backups && (
                  <span className="ml-1.5 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-xs text-blue-400">
                    {backups.weekly.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="monthly">
                Monthly
                {backups && (
                  <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-400">
                    {backups.monthly.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-4">
              <BackupTable entries={backups?.daily ?? []} onRestore={handleRestore} />
            </TabsContent>
            <TabsContent value="weekly" className="mt-4">
              <BackupTable entries={backups?.weekly ?? []} onRestore={handleRestore} />
            </TabsContent>
            <TabsContent value="monthly" className="mt-4">
              <BackupTable entries={backups?.monthly ?? []} onRestore={handleRestore} />
            </TabsContent>
          </Tabs>
        </CardContent>}
      </Card>

      <Separator />

      {/* Support Defaults */}
      <Card>
        <CardHeader className="cursor-pointer select-none" onClick={() => setSupportOpen(!supportOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-2xl text-primary">
                  Support Plan Defaults
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Default rates for post-launch support retainers.
                </p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${supportOpen ? "rotate-180" : ""}`} />
          </div>
        </CardHeader>
        {supportOpen && supportConfig && (
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="support-rate" className="text-base text-primary">Monthly Rate ($)</Label>
                <Input
                  id="support-rate"
                  type="number"
                  min={0}
                  value={supportConfig.defaultMonthlyRate}
                  onChange={(e) => setSupportConfig({ ...supportConfig, defaultMonthlyRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-hours" className="text-base text-primary">Included Hours</Label>
                <Input
                  id="support-hours"
                  type="number"
                  min={0}
                  value={supportConfig.defaultIncludedHours}
                  onChange={(e) => setSupportConfig({ ...supportConfig, defaultIncludedHours: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-overage" className="text-base text-primary">Overage Rate ($/hr)</Label>
                <Input
                  id="support-overage"
                  type="number"
                  min={0}
                  value={supportConfig.defaultOverageRate}
                  onChange={(e) => setSupportConfig({ ...supportConfig, defaultOverageRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-free" className="text-base text-primary">Annual Free Months</Label>
                <p className="text-xs text-muted-foreground">
                  Months waived on annual plans (e.g., 2 = pay 10 months, get 12).
                </p>
                <Input
                  id="support-free"
                  type="number"
                  min={0}
                  max={6}
                  value={supportConfig.annualFreeMonths}
                  onChange={(e) => setSupportConfig({ ...supportConfig, annualFreeMonths: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
              <p>Annual plan: {12 - supportConfig.annualFreeMonths} × ${supportConfig.defaultMonthlyRate} = <strong className="text-foreground">${(12 - supportConfig.annualFreeMonths) * supportConfig.defaultMonthlyRate}/year</strong> ({supportConfig.annualFreeMonths} months free)</p>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Button onClick={handleSupportSave} disabled={supportSaving}>
                <Save className="mr-2 h-4 w-4" />
                {supportSaving ? "Saving..." : supportSaved ? "Saved!" : "Save Defaults"}
              </Button>
              <Button variant="outline" onClick={handleSupportReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
