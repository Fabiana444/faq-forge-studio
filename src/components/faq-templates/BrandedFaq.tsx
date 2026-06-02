import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { RichText } from "@/components/RichText";

export function BrandedFaq({
  items,
  config,
}: {
  items: FaqItem[];
  config: FaqConfig;
}) {
  return (
    <div
      className="space-y-4 rounded-2xl p-8"
      style={{ background: config.backgroundColor }}
    >
      <header className="mb-6 flex items-center gap-3 border-b pb-4" style={{ borderColor: config.borderColor }}>
        {config.logoUrl ? (
          <img
            src={config.logoUrl}
            alt={config.brandName || "Logo"}
            className="h-10 w-10 rounded-md object-contain"
          />
        ) : (
          <div
            className="grid h-10 w-10 place-items-center rounded-md font-bold text-white"
            style={{ background: config.accentColor }}
          >
            {(config.brandName || "B")[0]}
          </div>
        )}
        <div>
          <div
            className="text-xs uppercase tracking-wider"
            style={{ color: config.accentColor }}
          >
            {config.brandName || "Marca"}
          </div>
          <h2 className="text-lg font-semibold" style={{ color: config.questionColor }}>
            Perguntas Frequentes
          </h2>
        </div>
      </header>
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
      className="overflow-hidden rounded-xl"
      style={{
        border: `1px solid ${config.borderColor}`,
        background: "rgba(255,255,255,0.6)",
      }}
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
        <RichText
          html={item.answer}
          className="px-5 pb-5 text-sm leading-relaxed"
          style={{ color: config.answerColor }}
        />
      )}
    </div>
  );
}
