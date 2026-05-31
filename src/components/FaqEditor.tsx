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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FaqRenderer } from "@/components/FaqRenderer";
import {
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
      {/* Editor panel */}
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
            {doc.items.map((it, i) => (
              <div
                key={it.id}
                className="space-y-2 rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    #{i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(it.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {(doc.template === "categorized" ||
                  doc.template === "private") && (
                  <Input
                    placeholder="Categoria"
                    value={it.category || ""}
                    onChange={(e) =>
                      updateItem(it.id, { category: e.target.value })
                    }
                  />
                )}
                <Input
                  placeholder="Pergunta"
                  value={it.question}
                  onChange={(e) =>
                    updateItem(it.id, { question: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Resposta"
                  value={it.answer}
                  rows={3}
                  onChange={(e) =>
                    updateItem(it.id, { answer: e.target.value })
                  }
                />
                {doc.template === "rich-media" && (
                  <>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="URL da imagem (opcional)"
                        value={it.imageUrl || ""}
                        onChange={(e) =>
                          updateItem(it.id, { imageUrl: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Linguagem (ex: typescript)"
                        value={it.codeLang || ""}
                        onChange={(e) =>
                          updateItem(it.id, { codeLang: e.target.value })
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Bloco de código (opcional)"
                      value={it.code || ""}
                      rows={3}
                      onChange={(e) =>
                        updateItem(it.id, { code: e.target.value })
                      }
                    />
                  </>
                )}
              </div>
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

      {/* Preview */}
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
