"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Send,
  ListChecks,
  StickyNote,
  Save,
  Pencil,
  CloudCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WORKFLOW_STAGES, type ProjectStatus } from "@/types";
import { toast } from "sonner";

interface StageTask {
  id: string;
  title: string;
  completed: boolean;
  stage: string;
}

interface StageNote {
  id: string;
  content: string;
  stage: string;
  createdAt: string;
}

interface StageWorkPanelProps {
  projectId: string;
  currentStage: ProjectStatus;
}

function useDebounce(callback: () => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  return useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callbackRef.current(), delay);
  }, [delay]);
}

export function StageWorkPanel({ projectId, currentStage }: StageWorkPanelProps) {
  const [tasks, setTasks] = useState<StageTask[]>([]);
  const [notes, setNotes] = useState<StageNote[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newNote, setNewNote] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const stageLabel = WORKFLOW_STAGES.find((s) => s.key === currentStage)?.label ?? currentStage;

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/stage-tasks?stage=${currentStage}`);
    if (res.ok) setTasks(await res.json());
  }, [projectId, currentStage]);

  const fetchNotes = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/stage-notes?stage=${currentStage}`);
    if (res.ok) setNotes(await res.json());
  }, [projectId, currentStage]);

  useEffect(() => {
    fetchTasks();
    fetchNotes();
    setEditingTaskId(null);
    setEditingNoteId(null);
    setNoteSaved(false);
  }, [fetchTasks, fetchNotes]);

  // ── Task CRUD ──

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setAddingTask(true);
    await fetch(`/api/projects/${projectId}/stage-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: currentStage, title: newTask.trim() }),
    });
    setNewTask("");
    setAddingTask(false);
    fetchTasks();
  }

  async function toggleTask(task: StageTask) {
    await fetch(`/api/projects/${projectId}/stage-tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    fetchTasks();
  }

  async function saveTaskTitle(taskId: string, title: string) {
    if (!title.trim()) return;
    await fetch(`/api/projects/${projectId}/stage-tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setEditingTaskId(null);
    fetchTasks();
    toast.success("Task updated");
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/projects/${projectId}/stage-tasks/${taskId}`, { method: "DELETE" });
    fetchTasks();
  }

  // ── Note CRUD ──

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    await fetch(`/api/projects/${projectId}/stage-notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: currentStage, content: newNote.trim() }),
    });
    setNewNote("");
    setAddingNote(false);
    fetchNotes();
  }

  const saveNoteEdit = useCallback(async () => {
    if (!editingNoteId || !editingNoteContent.trim()) return;
    setNoteSaving(true);
    await fetch(`/api/projects/${projectId}/stage-notes/${editingNoteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editingNoteContent.trim() }),
    });
    setNoteSaving(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
    fetchNotes();
  }, [editingNoteId, editingNoteContent, projectId, fetchNotes]);

  const debouncedSaveNote = useDebounce(saveNoteEdit, 1500);

  function handleNoteEdit(content: string) {
    setEditingNoteContent(content);
    setNoteSaved(false);
    debouncedSaveNote();
  }

  async function deleteNote(noteId: string) {
    await fetch(`/api/projects/${projectId}/stage-notes/${noteId}`, { method: "DELETE" });
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setEditingNoteContent("");
    }
    fetchNotes();
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">
          Stage Work — <span className="text-primary">{stageLabel}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tasks and notes for the current stage. Click any text to edit.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── Tasks ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-primary">
              Tasks
              {tasks.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  {completedCount}/{tasks.length} done
                </span>
              )}
            </h3>
          </div>

          <div className="space-y-1.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
              >
                <button type="button" onClick={() => toggleTask(task)} className="shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 text-muted-foreground" />
                  )}
                </button>

                {editingTaskId === task.id ? (
                  <Input
                    value={editingTaskTitle}
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    onBlur={() => saveTaskTitle(task.id, editingTaskTitle)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTaskTitle(task.id, editingTaskTitle);
                      if (e.key === "Escape") setEditingTaskId(null);
                    }}
                    className="h-7 flex-1 text-sm"
                    autoFocus
                  />
                ) : (
                  <span
                    className={cn(
                      "flex-1 text-sm cursor-pointer",
                      task.completed && "line-through text-muted-foreground"
                    )}
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setEditingTaskTitle(task.title);
                    }}
                    title="Click to edit"
                  >
                    {task.title}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingTaskId(task.id);
                    setEditingTaskTitle(task.title);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addTask} className="flex gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="flex-1"
              disabled={addingTask}
            />
            <Button type="submit" size="icon" variant="outline" disabled={addingTask || !newTask.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <Separator />

        {/* ── Notes ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-primary">Notes</h3>
          </div>

          <form onSubmit={addNote} className="flex gap-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this stage..."
              rows={2}
              className="flex-1"
              disabled={addingNote}
            />
            <Button type="submit" size="icon" variant="outline" disabled={addingNote || !newNote.trim()} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="group rounded-md border border-border bg-muted/30 p-3">
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingNoteContent}
                      onChange={(e) => handleNoteEdit(e.target.value)}
                      rows={3}
                      className="font-notes text-lg leading-snug"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => { saveNoteEdit(); setEditingNoteId(null); }}
                      >
                        <Save className="mr-1.5 h-3 w-3" />
                        Save Changes
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingNoteId(null); setNoteSaved(false); }}
                      >
                        Cancel
                      </Button>
                      {noteSaving && (
                        <span className="text-[10px] text-muted-foreground">Saving...</span>
                      )}
                      {noteSaved && !noteSaving && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                          <CloudCheck className="h-3.5 w-3.5" />
                          Saved
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-notes text-lg leading-snug whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Edit note"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingNoteContent(note.content);
                            setNoteSaved(false);
                          }}
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button type="button" title="Delete note" onClick={() => deleteNote(note.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-xs text-muted-foreground">No notes for this stage yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
