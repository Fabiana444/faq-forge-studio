import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { RichText } from "@/components/RichText";
import { SEASONAL_PRESETS } from "@/lib/faq-types";
import { itemFontStyle, mergeStyle } from "@/lib/faq-fonts";


/**
 * FAQ com decoração para datas comemorativas.
 * O tema (christmas, sao-joao, black-friday, new-year, valentines, halloween, custom)
 * vem em config.seasonalTheme. Cores podem ser ajustadas em
 * config.seasonalAccent e config.seasonalSecondary, ou usar as do preset.
 */
export function SeasonalFaq({
  items,
  config,
}: {
  items: FaqItem[];
  config: FaqConfig;
}) {
  const theme = config.seasonalTheme || "christmas";
  const preset = SEASONAL_PRESETS[theme];
  const accent = config.seasonalAccent || preset.accent;
  const secondary = config.seasonalSecondary || preset.secondary;
  const bg = config.backgroundColor || preset.bg;

  const isDark = theme === "black-friday" || theme === "new-year" || theme === "halloween";

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{ background: bg }}
    >
      <Decorations theme={theme} accent={accent} secondary={secondary} />

      <header
        className="relative mb-6 text-center"
        style={{ color: isDark ? "#fff" : config.questionColor }}
      >
        <div className="text-4xl">{preset.icon}</div>
        <h3 className="mt-2 text-xl font-bold tracking-tight">{preset.name}</h3>
      </header>

      <div className="relative space-y-3">
        {items.map((it) => (
          <Item
            key={it.id}
            item={it}
            accent={accent}
            secondary={secondary}
            isDark={isDark}
            config={config}
          />
        ))}
      </div>
    </div>
  );
}

function Item({
  item,
  accent,
  secondary,
  isDark,
  config,
}: {
  item: FaqItem;
  accent: string;
  secondary: string;
  isDark: boolean;
  config: FaqConfig;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden rounded-xl border-2 shadow-sm transition-all"
      style={{
        borderColor: accent,
        background: item.bgColor || (isDark ? "rgba(255,255,255,0.05)" : "#fff"),
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span
          className="font-semibold"
          style={mergeStyle({ color: isDark ? "#fff" : config.questionColor }, itemFontStyle(item, "question"))}
        >
          {item.question}
        </span>
        <ChevronDown
          className="h-4 w-4 transition-transform"
          style={{
            color: accent,
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      {open && (
        <RichText
          html={item.answer}
          className="px-5 pb-5 text-sm leading-relaxed"
          style={mergeStyle({ color: isDark ? "rgba(255,255,255,0.85)" : config.answerColor }, itemFontStyle(item, "answer"))}
        />
      )}

      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${accent}, ${secondary})`,
        }}
      />
    </div>
  );
}

function Decorations({
  theme,
  accent,
  secondary,
}: {
  theme: string;
  accent: string;
  secondary: string;
}) {
  if (theme === "christmas") {
    return (
      <>
        <div className="pointer-events-none absolute -top-4 left-4 text-3xl">❄️</div>
        <div className="pointer-events-none absolute top-2 right-6 text-2xl">🎁</div>
        <div className="pointer-events-none absolute bottom-2 right-3 text-3xl">⭐</div>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-2"
          style={{ background: `repeating-linear-gradient(90deg, ${accent} 0 16px, ${secondary} 16px 32px)` }}
        />
      </>
    );
  }
  if (theme === "sao-joao") {
    return (
      <>
        <div className="pointer-events-none absolute top-2 left-4 text-2xl">🌽</div>
        <div className="pointer-events-none absolute top-3 right-4 text-2xl">🔥</div>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-around text-2xl"
          style={{ color: accent }}
        >
          <span>🚩</span><span>🚩</span><span>🚩</span><span>🚩</span><span>🚩</span>
        </div>
      </>
    );
  }
  if (theme === "black-friday") {
    return (
      <>
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rotate-12 rounded-lg text-center font-extrabold text-3xl leading-[8rem]"
          style={{ background: accent, color: "#000" }}
        >
          -70%
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      </>
    );
  }
  if (theme === "new-year") {
    return (
      <>
        <div className="pointer-events-none absolute top-1 left-2 text-3xl">🎆</div>
        <div className="pointer-events-none absolute top-2 right-2 text-3xl">🥂</div>
        <div className="pointer-events-none absolute bottom-2 left-4 text-2xl">✨</div>
      </>
    );
  }
  if (theme === "valentines") {
    return (
      <>
        <div className="pointer-events-none absolute top-2 left-2 text-2xl">💕</div>
        <div className="pointer-events-none absolute top-4 right-3 text-2xl">🌹</div>
        <div className="pointer-events-none absolute bottom-3 right-6 text-2xl">💌</div>
      </>
    );
  }
  if (theme === "halloween") {
    return (
      <>
        <div className="pointer-events-none absolute top-2 left-3 text-3xl">🎃</div>
        <div className="pointer-events-none absolute top-2 right-3 text-2xl">🦇</div>
        <div className="pointer-events-none absolute bottom-2 left-6 text-2xl">👻</div>
      </>
    );
  }
  return null;
}
