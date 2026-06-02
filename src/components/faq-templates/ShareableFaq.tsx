import { useState } from "react";
import {
  ChevronDown,
  Copy,
  Share2,
  Check,
  Link2,
  Mail,
  MessageCircle,
} from "lucide-react";
import type { FaqConfig, FaqItem } from "@/lib/faq-types";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RichText } from "@/components/RichText";

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "pergunta";

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
  const [copied, setCopied] = useState<"text" | "link" | null>(null);

  const anchorId = `q-${slug(item.question)}-${item.id.slice(0, 6)}`;
  const plainAnswer = item.answer.replace(/<[^>]+>/g, "");
  const text = `${item.question}\n\n${plainAnswer}`;
  const directLink =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#${anchorId}`
      : `#${anchorId}`;

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied("text");
    toast.success("Pergunta e resposta copiadas");
    setTimeout(() => setCopied(null), 1500);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(directLink);
    setCopied("link");
    toast.success("Link da pergunta copiado");
    setTimeout(() => setCopied(null), 1500);
  };

  const shareWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = encodeURIComponent(`${text}\n\n${directLink}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  const shareEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    const subject = encodeURIComponent(item.question);
    const body = encodeURIComponent(`${plainAnswer}\n\n${directLink}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareNative = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: item.question, text, url: directLink });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(directLink);
      toast.success("Link copiado");
    }
  };

  return (
    <div
      id={anchorId}
      className="overflow-hidden rounded-xl border scroll-mt-24"
      style={{ borderColor: config.borderColor }}
    >
      <div className="flex items-stretch">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <a
            href={`#${anchorId}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium hover:underline"
            style={{ color: config.questionColor }}
          >
            {item.question}
          </a>
          <ChevronDown
            className="h-4 w-4 transition-transform"
            style={{
              color: config.accentColor,
              transform: open ? "rotate(180deg)" : "none",
            }}
          />
        </button>
        <div className="flex items-center gap-1 pr-3">
          <IconBtn onClick={copyLink} title="Copiar link da pergunta" color={config.accentColor}>
            {copied === "link" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          </IconBtn>
          <IconBtn onClick={copy} title="Copiar pergunta e resposta" color={config.accentColor}>
            {copied === "text" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </IconBtn>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                title="Compartilhar"
                className="grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-black/5"
                style={{ color: config.accentColor }}
              >
                <Share2 className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={shareWhatsapp}>
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareEmail}>
                <Mail className="mr-2 h-4 w-4" /> E-mail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareNative}>
                <Share2 className="mr-2 h-4 w-4" /> Outros…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {open && (
        <div className="px-5 pb-5">
          <RichText
            html={item.answer}
            className="text-sm leading-relaxed"
            style={{ color: config.answerColor }}
          />
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
