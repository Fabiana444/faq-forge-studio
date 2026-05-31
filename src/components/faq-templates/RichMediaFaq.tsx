import { useState } from "react";
import { ChevronDown, Code2, Copy } from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { toast } from "sonner";

export function RichMediaFaq({
  items,
  config,
}: {
  items: FaqItem[];
  config: FaqConfig;
}) {
  return (
    <div
      className="space-y-3 rounded-2xl p-6"
      style={{ background: config.backgroundColor }}
    >
      {items.map((it) => (
        <Item key={it.id} item={it} config={config} />
      ))}
    </div>
  );
}

function Item({ item, config }: { item: FaqItem; config: FaqConfig }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: config.borderColor }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium" style={{ color: config.questionColor }}>
          {item.question}
        </span>
        <ChevronDown
          className="h-4 w-4 transition-transform"
          style={{
            color: config.accentColor,
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      {open && (
        <div
          className="space-y-4 px-5 pb-5 text-sm leading-relaxed"
          style={{ color: config.answerColor }}
        >
          <p>{item.answer}</p>
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.question}
              className="rounded-lg border"
              style={{ borderColor: config.borderColor }}
            />
          )}
          {item.code && <CodeBlock code={item.code} lang={item.codeLang} />}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-xs">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Code2 className="h-3.5 w-3.5" /> {lang || "código"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-2 py-1 text-slate-300 hover:bg-slate-800"
        >
          <Copy className="h-3 w-3" /> copiar
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
