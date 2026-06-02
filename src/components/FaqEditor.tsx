import { useState } from "react";
import {
  Plus,
  Trash2,
  Lock,
  Globe,
  Save,
  ExternalLink,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  Pencil,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FaqRenderer } from "@/components/FaqRenderer";
import { RichTextToolbar } from "@/components/RichTextToolbar";
import {
  CODE_LANGUAGES,
  CODE_LAYOUTS,
  type CodeLayout,
  type CodeTheme,
  type FaqDocument,
  type FaqItem,
  type TemplateKey,
  TEMPLATE_META,
} from "@/lib/faq-types";

interface Props {
  doc: FaqDocument;
  onChange: (d: FaqDocument) => void;
  onSave: () => void | Promise<void>;
  saving?: boolean;
  publicUrl?: string;
}

export function FaqEditor({ doc, onChange, onSave, saving, publicUrl }: Props) {
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");
  const update = (patch: Partial<FaqDocument>) => onChange({ ...doc, ...patch });
  const updateItem = (id: string, patch: Partial<FaqItem>) =>
    update({
      items: doc.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  const addItem = () =>
    update({
      items: [
        ...doc.items,
        {
          id: crypto.randomUUID(),
          category: doc.template === "private" ? "🔒 Privado" : "Geral",
          question: "Nova pergunta",
          answer: "Resposta...",
        },
      ],
    });
  const removeItem = (id: string) =>
    update({ items: doc.items.filter((it) => it.id !== id) });

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <aside className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="space-y-2">
          <Label htmlFor="title">Título da FAQ</Label>
          <Input
            id="title"
            value={doc.title}
            onChange={(e) => update({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Modelo</Label>
          <Select
            value={doc.template}
            onValueChange={(v) => update({ template: v as TemplateKey })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TEMPLATE_META).map(([k, m]) => (
                <SelectItem key={k} value={k}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {TEMPLATE_META[doc.template].description}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-sm">
            {doc.visibility === "private" ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            <span>{doc.visibility === "private" ? "Privada" : "Pública"}</span>
          </div>
          <Switch
            checked={doc.visibility === "public"}
            onCheckedChange={(v) =>
              update({ visibility: v ? "public" : "private" })
            }
          />
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["content", "style"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                activeTab === t
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "content" ? "Conteúdo" : "Estilo"}
            </button>
          ))}
        </div>

        {activeTab === "content" ? (
          <div className="space-y-3">
            {doc.template === "rich-media" && <RichMediaHelp />}
            {doc.items.map((it, i) => (
              <ItemCard
                key={it.id}
                index={i}
                item={it}
                template={doc.template}
                onChange={(patch) => updateItem(it.id, patch)}
                onRemove={() => removeItem(it.id)}
              />
            ))}
            <Button variant="outline" className="w-full" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar pergunta
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <ColorRow
              label="Cor de destaque"
              value={doc.config.accentColor}
              onChange={(v) =>
                update({ config: { ...doc.config, accentColor: v } })
              }
            />
            <ColorRow
              label="Cor das perguntas"
              value={doc.config.questionColor}
              onChange={(v) =>
                update({ config: { ...doc.config, questionColor: v } })
              }
            />
            <ColorRow
              label="Cor das respostas"
              value={doc.config.answerColor}
              onChange={(v) =>
                update({ config: { ...doc.config, answerColor: v } })
              }
            />
            <ColorRow
              label="Cor de fundo"
              value={doc.config.backgroundColor}
              onChange={(v) =>
                update({ config: { ...doc.config, backgroundColor: v } })
              }
            />
            <ColorRow
              label="Cor da borda"
              value={doc.config.borderColor}
              onChange={(v) =>
                update({ config: { ...doc.config, borderColor: v } })
              }
            />
            {doc.template === "branded" && (
              <>
                <div className="space-y-2">
                  <Label>Nome da marca</Label>
                  <Input
                    value={doc.config.brandName || ""}
                    onChange={(e) =>
                      update({
                        config: { ...doc.config, brandName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL do logo</Label>
                  <Input
                    placeholder="https://..."
                    value={doc.config.logoUrl || ""}
                    onChange={(e) =>
                      update({
                        config: { ...doc.config, logoUrl: e.target.value },
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={onSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          {publicUrl && (
            <Button variant="outline" asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </aside>

      <div className="rounded-2xl border border-border bg-[image:var(--gradient-subtle)] p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{doc.title}</h2>
          <span className="rounded-full bg-muted px-3 py-1 text-xs">
            Preview · {TEMPLATE_META[doc.template].name}
          </span>
        </div>
        <FaqRenderer
          template={doc.template}
          items={doc.items}
          config={doc.config}
          isAuthenticated={false}
        />
      </div>
    </div>
  );
}

/* ---------------- Item card ---------------- */

function ItemCard({
  item,
  index,
  template,
  onChange,
  onRemove,
}: {
  item: FaqItem;
  index: number;
  template: TemplateKey;
  onChange: (patch: Partial<FaqItem>) => void;
  onRemove: () => void;
}) {
  const showCategory = template === "categorized" || template === "private";
  const showMedia = template === "rich-media";

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          #{index + 1}
        </span>
        <div className="flex items-center gap-1">
          <EditDialog
            item={item}
            template={template}
            onChange={onChange}
          />
          <Button variant="ghost" size="sm" onClick={onRemove} title="Excluir">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {showCategory && (
        <Input
          placeholder="Categoria (use 🔒 no início para travar)"
          value={item.category || ""}
          onChange={(e) => onChange({ category: e.target.value })}
        />
      )}
      <Input
        placeholder="Pergunta"
        value={item.question}
        onChange={(e) => onChange({ question: e.target.value })}
      />
      <RichTextToolbar
        value={item.answer}
        onChange={(v) => onChange({ answer: v })}
        placeholder="Resposta (use a barra para negrito, itálico, sublinhado e link)"
        rows={3}
      />
      {showMedia && (
        <div className="space-y-2 rounded-md border border-dashed border-border p-2">
          <MediaInput
            icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
            placeholder="URL da imagem"
            value={item.imageUrl || ""}
            onChange={(v) => onChange({ imageUrl: v })}
          />
          <MediaInput
            icon={<Video className="h-4 w-4 text-muted-foreground" />}
            placeholder="URL de vídeo (YouTube, Vimeo ou .mp4)"
            value={item.videoUrl || ""}
            onChange={(v) => onChange({ videoUrl: v })}
          />
          <MediaInput
            icon={<Music className="h-4 w-4 text-muted-foreground" />}
            placeholder="URL de áudio (.mp3, .wav, .ogg)"
            value={item.audioUrl || ""}
            onChange={(v) => onChange({ audioUrl: v })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] uppercase text-muted-foreground">
                Linguagem
              </Label>
              <Select
                value={item.codeLang || "plaintext"}
                onValueChange={(v) => onChange({ codeLang: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {CODE_LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] uppercase text-muted-foreground">
                Layout
              </Label>
              <Select
                value={item.codeLayout || "block"}
                onValueChange={(v) =>
                  onChange({ codeLayout: v as CodeLayout })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CODE_LAYOUTS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
            <Label className="flex items-center gap-2 text-xs">
              <Code2 className="h-3.5 w-3.5" />
              Tema escuro do código
            </Label>
            <Switch
              checked={(item.codeTheme || "dark") === "dark"}
              onCheckedChange={(v) =>
                onChange({ codeTheme: (v ? "dark" : "light") as CodeTheme })
              }
            />
          </div>
          <Textarea
            placeholder="Bloco de código (opcional)"
            value={item.code || ""}
            rows={3}
            onChange={(e) => onChange({ code: e.target.value })}
            className="font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}

function MediaInput({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ---------------- Edit dialog ---------------- */

function EditDialog({
  item,
  template,
  onChange,
}: {
  item: FaqItem;
  template: TemplateKey;
  onChange: (patch: Partial<FaqItem>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Editar em foco">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar pergunta</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {(template === "categorized" || template === "private") && (
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input
                value={item.category || ""}
                onChange={(e) => onChange({ category: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Pergunta</Label>
            <Input
              value={item.question}
              onChange={(e) => onChange({ question: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Resposta</Label>
            <RichTextToolbar
              value={item.answer}
              onChange={(v) => onChange({ answer: v })}
              rows={8}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Concluir</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Helpers ---------------- */

function RichMediaHelp() {
  return (
    <div className="space-y-1 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5 font-medium text-foreground">
        <Info className="h-3.5 w-3.5" /> Mídias suportadas
      </div>
      <p>
        <strong>Imagem:</strong> .jpg, .png, .webp, .gif, .svg — recomendado até
        2&nbsp;MB e 1600&nbsp;px de largura.
      </p>
      <p>
        <strong>Vídeo:</strong> links do YouTube/Vimeo ou arquivos .mp4 / .webm
        / .ogg — recomendado até 50&nbsp;MB.
      </p>
      <p>
        <strong>Áudio:</strong> .mp3, .wav, .ogg, .m4a — recomendado até
        20&nbsp;MB.
      </p>
      <p>
        <strong>Código:</strong> escolha a linguagem (HTML, CSS, JS, TS,
        Python, etc.), o layout (bloco, inline ou terminal) e o tema (claro ou
        escuro).
      </p>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-28 font-mono text-xs"
        />
      </div>
    </div>
  );
}
