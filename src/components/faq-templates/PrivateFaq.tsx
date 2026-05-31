import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";

/**
 * Itens cuja category começa com "🔒" ou contém "private" são restritos.
 * Quando o visitante não está logado eles aparecem como cadeado.
 */
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
    <TooltipProvider delayDuration={150}>
      <div
        className="space-y-3 rounded-2xl p-6"
        style={{ background: config.backgroundColor }}
      >
        {items.map((it) => {
          const locked = isPrivate(it) && !isAuthenticated;
          return locked ? (
            <LockedItem key={it.id} item={it} config={config} />
          ) : (
            <OpenItem key={it.id} item={it} config={config} />
          );
        })}
      </div>
    </TooltipProvider>
  );
}

const isPrivate = (it: FaqItem) =>
  it.category?.toLowerCase().includes("private") ||
  it.category?.startsWith("🔒") ||
  false;

function OpenItem({ item, config }: { item: FaqItem; config: FaqConfig }) {
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
          className="px-5 pb-5 text-sm leading-relaxed"
          style={{ color: config.answerColor }}
        >
          {item.answer}
        </div>
      )}
    </div>
  );
}

function LockedItem({ item, config }: { item: FaqItem; config: FaqConfig }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/auth"
          className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed px-5 py-4 text-left opacity-80 transition hover:opacity-100"
          style={{ borderColor: config.borderColor }}
        >
          <span
            className="font-medium blur-[3px] select-none"
            style={{ color: config.questionColor }}
          >
            {item.question}
          </span>
          <Lock className="h-4 w-4" style={{ color: config.accentColor }} />
        </Link>
      </TooltipTrigger>
      <TooltipContent>Faça login para acessar a FAQ</TooltipContent>
    </Tooltip>
  );
}
