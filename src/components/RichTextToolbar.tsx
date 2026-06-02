import { useRef } from "react";
import { Bold, Italic, Underline, Link as LinkIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

/**
 * Textarea com toolbar que envolve a seleção com tags HTML
 * permitidas pelo renderizador RichText (b, i, u, a).
 */
export function RichTextToolbar({
  value,
  onChange,
  placeholder,
  rows = 4,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.slice(start, end);
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = end + before.length;
    });
  };

  const insertLink = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.slice(start, end) || "texto do link";
    const url = window.prompt("URL do link (https://...)", "https://");
    if (!url) return;
    const tag = `<a href="${url}">${sel}</a>`;
    onChange(value.slice(0, start) + tag + value.slice(end));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 p-1">
        <ToolBtn title="Negrito" onClick={() => wrap("<b>", "</b>")}>
          <Bold className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Itálico" onClick={() => wrap("<i>", "</i>")}>
          <Italic className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Sublinhado" onClick={() => wrap("<u>", "</u>")}>
          <Underline className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Inserir link" onClick={insertLink}>
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolBtn>
        <span className="ml-auto pr-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          B / I / U / Link
        </span>
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function ToolBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded transition hover:bg-background"
    >
      {children}
    </button>
  );
}
