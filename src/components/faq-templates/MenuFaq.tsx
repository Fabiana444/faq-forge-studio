import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { RichText } from "@/components/RichText";
import { itemFontStyle, mergeStyle } from "@/lib/faq-fonts";

/**
 * Fase 4: FAQ em formato de menu/lista com seleção lateral.
 * Perguntas aparecem como itens de menu à esquerda,
 * respostas aparecem em um painel à direita.
 */
export function MenuFaq({
  items,
  config,
}: {
  items: FaqItem[];
  config: FaqConfig;
}) {
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id || "");
  const selected = items.find((it) => it.id === selectedId);

  return (
    <div
      className="flex gap-4 rounded-2xl p-6"
      style={{ background: config.backgroundColor }}
    >
      {/* Menu lateral */}
      <div className="w-full max-w-xs space-y-2 border-r border-border pr-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Perguntas
        </h3>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className="group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all"
            style={{
              background: selectedId === item.id ? config.accentColor : "transparent",
              color: selectedId === item.id ? "#fff" : config.questionColor,
            }}
          >
            <span
              className="truncate font-medium"
              style={itemFontStyle(item, "question")}
            >
              {item.question}
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 flex-shrink-0 transition-transform group-hover:translate-x-1"
              style={{
                color: selectedId === item.id ? "#fff" : config.accentColor,
              }}
            />
          </button>
        ))}
      </div>

      {/* Painel de resposta */}
      <div className="flex-1">
        {selected ? (
          <div className="space-y-3">
            <h2
              className="text-lg font-semibold"
              style={{
                color: config.questionColor,
                ...itemFontStyle(selected, "question"),
              }}
            >
              {selected.question}
            </h2>
            <div
              className="rounded-lg border border-border p-4"
              style={{
                background: selected.bgColor || "#f8fafc",
                borderColor: config.borderColor,
              }}
            >
              <RichText
                html={selected.answer}
                className="text-sm leading-relaxed"
                style={mergeStyle(
                  { color: config.answerColor },
                  itemFontStyle(selected, "answer")
                )}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            Selecione uma pergunta para ver a resposta
          </div>
        )}
      </div>
    </div>
  );
}
