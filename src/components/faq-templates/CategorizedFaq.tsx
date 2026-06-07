import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { RichText } from "@/components/RichText";
import { itemFontStyle, mergeStyle } from "@/lib/faq-fonts";


export function CategorizedFaq({
  items,
  config,
}: {
  items: FaqItem[];
  config: FaqConfig;
}) {
  const groups = useMemo(() => {
    const m = new Map<string, FaqItem[]>();
    items.forEach((it) => {
      const k = it.category?.trim() || "Geral";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    });
    return Array.from(m.entries());
  }, [items]);

  return (
    <div
      className="space-y-8 rounded-2xl p-6"
      style={{ background: config.backgroundColor }}
    >
      {groups.map(([cat, list]) => {
        const cc = config.categoryColors?.[cat] || {};
        return (
          <section key={cat}>
            <h3
              className="mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wide"
              style={{
                background: cc.bg || config.accentColor,
                color: cc.text || "#ffffff",
              }}
            >
              {cat}
            </h3>
            <div className="space-y-2">
              {list.map((it) => (
                <Item
                  key={it.id}
                  item={it}
                  config={config}
                  itemBg={it.bgColor || cc.itemBg}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Item({
  item,
  config,
  itemBg,
}: {
  item: FaqItem;
  config: FaqConfig;
  itemBg?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden rounded-xl border transition-all"
      style={{ borderColor: config.borderColor, background: itemBg }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium" style={{ color: config.questionColor }}>
          {item.question}
        </span>
        <ChevronDown
          className="h-4 w-4 flex-shrink-0 transition-transform"
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
