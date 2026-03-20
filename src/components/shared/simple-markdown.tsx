import { cn } from "@/lib/utils";

/**
 * Lightweight inline markdown renderer for chat bubbles.
 * Supports: **bold**, bullet lists (- item), and line breaks.
 */
export function SimpleMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const lines = content.split("\n");

  return (
    <div className={cn("space-y-1", className)}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const text = isBullet ? trimmed.slice(2) : trimmed;

        return (
          <div key={i} className={isBullet ? "flex gap-1.5" : ""}>
            {isBullet && (
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            )}
            <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
          </div>
        );
      })}
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-background/50 px-1 py-0.5 text-xs">$1</code>');
}
