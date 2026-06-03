import { useState } from "react";
import { ChevronDown, Lock, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { RichText } from "@/components/RichText";

export function PrivateFaq({
  items,
  config,
  isAuthenticated,
}: {
  items: FaqItem[];
  config: FaqConfig;
  isAuthenticated: boolean;
}) {
  return (
    <div
      className="space-y-3 rounded-2xl p-6"
      style={{ background: config.backgroundColor }}
    >
      {items.map((it) => (
        <Item
          key={it.id}
          item={it}
          config={config}
          locked={isPrivate(it) && !isAuthenticated}
        />
      ))}
    </div>
  );
}

const isPrivate = (it: FaqItem) =>
  it.category?.toLowerCase().includes("private") ||
  it.category?.startsWith("🔒") ||
  false;

function Item({
  item,
  config,
  locked,
}: {
  item: FaqItem;
  config: FaqConfig;
  locked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const lockColor = config.lockColor || config.accentColor;
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: config.borderColor,
        background: item.bgColor,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span
          className="flex items-center gap-2 font-medium"
          style={{ color: config.questionColor }}
        >
          {locked && (
            <span title="Faça login para acessar a FAQ">
              <Lock className="h-3.5 w-3.5" style={{ color: lockColor }} />
            </span>
          )}
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
        <div className="px-5 pb-5">
          {locked ? (
            <div
              className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-4 text-sm"
              style={{
                borderColor: config.borderColor,
                background: config.loginBoxBg || "#f8fafc",
                color: config.answerColor,
              }}
            >
              {config.loginBoxLogoUrl && (
                <img
                  src={config.loginBoxLogoUrl}
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                />
              )}
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" style={{ color: lockColor }} />
                <strong style={{ color: config.questionColor }}>
                  Conteúdo protegido
                </strong>
              </div>
              <p>Faça login para acessar esta resposta.</p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: config.accentColor }}
              >
                <LogIn className="h-3.5 w-3.5" /> Fazer login
              </Link>
            </div>
          ) : (
            <RichText
              html={item.answer}
              className="text-sm leading-relaxed"
              style={{ color: config.answerColor }}
            />
          )}
        </div>
      )}
    </div>
  );
}
