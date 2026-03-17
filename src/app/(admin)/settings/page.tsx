"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bot, RotateCcw, Save, Plus, X } from "lucide-react";
import Image from "next/image";
import type { AthenaConfig } from "@/lib/athena-config";

export default function SettingsPage() {
  const [config, setConfig] = useState<AthenaConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newModel, setNewModel] = useState("");

  useEffect(() => {
    fetch("/api/athena/config")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

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
        setTimeout(() => setSaved(false), 3000);
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
      setTimeout(() => setSaved(false), 3000);
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
        <CardHeader>
          <div className="flex items-center gap-3">
            <Image
              src="/Athena.png"
              alt="Athena"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <CardTitle className="font-display text-xl">
                Athena Preferences
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure the AI assistant&apos;s behavior, personality, and limits.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="text-sm font-medium">
              System Prompt
            </Label>
            <p className="text-xs text-muted-foreground">
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
              <Label htmlFor="maxTokens">Max Output Tokens</Label>
              <p className="text-xs text-muted-foreground">
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
              <Label htmlFor="temperature">Temperature</Label>
              <p className="text-xs text-muted-foreground">
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
            <Label>Free Models (OpenRouter)</Label>
            <p className="text-xs text-muted-foreground">
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
                <Label>OpenAI Fallback</Label>
                <p className="text-xs text-muted-foreground">
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
                <Label htmlFor="fallbackModel">Fallback Model</Label>
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
        </CardContent>
      </Card>
    </div>
  );
}
