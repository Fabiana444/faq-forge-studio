import { useState } from "react";
import { ChevronDown, Code2, Copy } from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { toast } from "sonner";
import { RichText } from "@/components/RichText";
import { itemFontStyle, mergeStyle } from "@/lib/faq-fonts";


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
          <RichText html={item.answer} />
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.question}
              className="max-h-[480px] w-full rounded-lg border object-contain"
              style={{ borderColor: config.borderColor }}
            />
          )}
          {item.videoUrl && <VideoEmbed url={item.videoUrl} />}
          {item.audioUrl && (
            <audio controls src={item.audioUrl} className="w-full">
              Seu navegador não suporta áudio.
            </audio>
          )}
          {item.code && (
            <CodeBlock
              code={item.code}
              lang={item.codeLang}
              layout={item.codeLayout}
              theme={item.codeTheme}
            />
          )}
        </div>
      )}
    </div>
  );
}

function VideoEmbed({ url }: { url: string }) {
  // YouTube
  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  if (yt) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border">
        <iframe
          src={`https://www.youtube.com/embed/${yt[1]}`}
          title="YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border">
        <iframe
          src={`https://player.vimeo.com/video/${vm[1]}`}
          title="Vimeo"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  // Vídeo nativo (mp4, webm, ogg)
  return (
    <video controls src={url} className="w-full rounded-lg border">
      Seu navegador não suporta vídeo.
    </video>
  );
}

function CodeBlock({
  code,
  lang,
  layout = "block",
  theme = "dark",
}: {
  code: string;
  lang?: string;
  layout?: "block" | "inline" | "terminal";
  theme?: "dark" | "light";
}) {
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };

  if (layout === "inline") {
    return (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
        {code}
      </code>
    );
  }

  const isDark = theme === "dark" || layout === "terminal";
  const containerCls = isDark
    ? "border-slate-800 bg-slate-950 text-slate-100"
    : "border-slate-200 bg-slate-50 text-slate-800";
  const headerCls = isDark
    ? "border-slate-800 text-slate-400"
    : "border-slate-200 text-slate-500";
  const btnCls = isDark
    ? "text-slate-300 hover:bg-slate-800"
    : "text-slate-600 hover:bg-slate-200";

  return (
    <div className={`overflow-hidden rounded-lg border ${containerCls}`}>
      <div
        className={`flex items-center justify-between border-b px-3 py-2 text-xs ${headerCls}`}
      >
        <span className="flex items-center gap-1.5">
          {layout === "terminal" ? (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="ml-2">{lang || "shell"}</span>
            </>
          ) : (
            <>
              <Code2 className="h-3.5 w-3.5" /> {lang || "código"}
            </>
          )}
        </span>
        <button
          onClick={copy}
          className={`flex items-center gap-1 rounded px-2 py-1 ${btnCls}`}
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
