import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { RichText } from "@/components/RichText";
import { itemFontStyle, mergeStyle } from "@/lib/faq-fonts";


export function NumberedFaq({
  items,
  config,
}: {
  items: FaqItem[];
  config: FaqConfig;
}) {
  return (
    <ol
      className="space-y-3 rounded-2xl p-6"
      style={{ background: config.backgroundColor }}
    >
      {items.map((it, i) => (
        <Item key={it.id} index={i + 1} item={it} config={config} />
      ))}
    </ol>
  );
}

function Item({
  index,
  item,
  config,
}: {
  index: number;
  item: FaqItem;
  config: FaqConfig;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: config.borderColor,
        background: item.bgColor,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <span
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-bold text-white tabular-nums"
          style={{ background: config.accentColor }}
        >
          {index}
        </span>
        <span
          className="flex-1 font-medium"
          style={{ color: config.questionColor }}
        >
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
          className="px-5 pb-5 pl-[4.5rem] text-sm leading-relaxed"
          style={{ color: config.answerColor }}
        />
      )}
    </li>
  );
}
