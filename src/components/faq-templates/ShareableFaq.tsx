import { useState } from "react";
import { ChevronDown, Copy, Share2, Check } from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { toast } from "sonner";

export function ShareableFaq({
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
  const [copied, setCopied] = useState(false);

  const text = `${item.question}\n\n${item.answer}`;

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 1500);
  };

  const share = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: item.question, text });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Link copiado para compartilhar");
    }
  };

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: config.borderColor }}
    >
      <div className="flex items-stretch">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left"
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
        <div className="flex items-center gap-1 pr-3">
          <IconBtn onClick={copy} title="Copiar" color={config.accentColor}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </IconBtn>
          <IconBtn onClick={share} title="Compartilhar" color={config.accentColor}>
            <Share2 className="h-4 w-4" />
          </IconBtn>
        </div>
      </div>
      {open && (
        <div
          className="px-5 pb-5 text-sm leading-relaxed"
          style={{ color: config.answerColor }}
        >
          {item.answer}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  color,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-black/5"
      style={{ color }}
    >
      {children}
    </button>
  );
}
