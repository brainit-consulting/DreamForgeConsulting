"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Rnd } from "react-rnd";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AthenaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "/api/ai/chat" });

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg forge-glow"
        size="icon"
        aria-label="Open Athena AI assistant"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Rnd
        default={{
          x: typeof window !== "undefined" ? window.innerWidth - 420 : 800,
          y: typeof window !== "undefined" ? window.innerHeight - 580 : 200,
          width: 400,
          height: 560,
        }}
        minWidth={350}
        minHeight={400}
        bounds="window"
        dragHandleClassName="athena-drag-handle"
        className="pointer-events-auto overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="athena-drag-handle flex h-12 cursor-move items-center justify-between border-b border-border bg-muted/50 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-display text-sm">Athena</span>
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                AI Assistant
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
            aria-label="Close Athena"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[calc(100%-6.5rem)] px-4 py-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="font-display text-lg">Hey there!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                I&apos;m Athena, your DreamForge assistant.
                <br />
                How can I help you today?
              </p>
            </div>
          )}
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-muted px-3 py-2 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask Athena anything..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Rnd>
    </div>
  );
}
