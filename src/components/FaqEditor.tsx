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
  Info,
  ArrowUp,
  ArrowDown,
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
import { Textarea } from "@/components/ui/textarea";
import { FaqRenderer } from "@/components/FaqRenderer";
import { RichTextToolbar } from "@/components/RichTextToolbar";
import { useAuth } from "@/hooks/use-auth";
import { LogoUpload } from "@/components/LogoUpload";
import {
  CODE_LANGUAGES,
  CODE_LAYOUTS,
  SEASONAL_PRESETS,
  type CodeLayout,
  type CodeTheme,
  type CustomFont,
  type FaqDocument,
  type FaqItem,
  type SeasonalTheme,
  type TemplateKey,
  TEMPLATE_META,
} from "@/lib/faq-types";
import { WEB_FONTS } from "@/lib/faq-fonts";
import { toast } from "sonner";


interface Props {
  doc: FaqDocument;
  onChange: (d: FaqDocument) => void;
  onSave: () => void | Promise<void>;
  saving?: boolean;
  publicUrl?: string;
}

export function FaqEditor({ doc, onChange, onSave, saving, publicUrl }: Props) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");
  const update = (patch: Partial<FaqDocument>) => onChange({ ...doc, ...patch });
  const updateItem = (id: string, patch: Partial<FaqItem>) =>
    update({
      items: doc.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  const addItem = () => {
    // Fase 2.1: Verificar limite de trial
    if (profile?.limits) {
      const { faqCount, faqLimit, plan } = profile.limits;
      if (plan === "free" && faqCount >= faqLimit) {
        toast.error("Limite de trial atingido (7 FAQs). Faça upgrade para criar mais.", {
          action: {
            label: "Ver Planos",
            onClick: () => window.open("https://docspace.tec.br/pricing", "_blank"),
          },
        });
        return;
      }
    }

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
  };
  const removeItem = (id: string) =>
    update({ items: doc.items.filter((it) => it.id !== id) });
  const move = (id: string, dir: -1 | 1) => {
    const arr = [...doc.items];
    const i = arr.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    update({ items: arr });
  };

  // distinct categories (Categorizado)
  const categories = Array.from(
    new Set(doc.items.map((it) => it.category?.trim() || "Geral")),
  );

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
                total={doc.items.length}
                item={it}
                template={doc.template}
                customFonts={doc.config.customFonts || []}
                onChange={(patch) => updateItem(it.id, patch)}
                onRemove={() => removeItem(it.id)}
                onMove={(d) => move(it.id, d)}
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

            <CustomFontsManager
              fonts={doc.config.customFonts || []}
              onChange={(fonts) =>
                update({ config: { ...doc.config, customFonts: fonts } })
              }
            />



            {doc.template === "categorized" && categories.length > 0 && (
              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <Label className="text-xs uppercase text-muted-foreground">
                  Cores por categoria
                </Label>
                {categories.map((c) => {
                  const cc = doc.config.categoryColors?.[c] || {};
                  const setCC = (patch: Partial<typeof cc>) =>
                    update({
                      config: {
                        ...doc.config,
                        categoryColors: {
                          ...(doc.config.categoryColors || {}),
                          [c]: { ...cc, ...patch },
                        },
                      },
                    });
                  return (
                    <div key={c} className="space-y-2 rounded-md border p-2">
                      <div className="text-xs font-semibold">{c}</div>
                      <ColorRow label="Fundo título" value={cc.bg || doc.config.accentColor} onChange={(v) => setCC({ bg: v })} />
                      <ColorRow label="Texto título" value={cc.text || "#ffffff"} onChange={(v) => setCC({ text: v })} />
                      <ColorRow label="Fundo perguntas" value={cc.itemBg || "#ffffff"} onChange={(v) => setCC({ itemBg: v })} />
                    </div>
                  );
                })}
              </div>
            )}

            {doc.template === "private" && (
              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <Label className="text-xs uppercase text-muted-foreground">
                  Acesso Restrito
                </Label>
                <ColorRow
                  label="Cor do cadeado"
                  value={doc.config.lockColor || doc.config.accentColor}
                  onChange={(v) => update({ config: { ...doc.config, lockColor: v } })}
                />
                <ColorRow
                  label="Fundo da caixa de login"
                  value={doc.config.loginBoxBg || "#f8fafc"}
                  onChange={(v) => update({ config: { ...doc.config, loginBoxBg: v } })}
                />
                <div className="space-y-1">
                  <Label className="text-xs">Logo na caixa de login (URL)</Label>
                  <Input
                    placeholder="https://..."
                    value={doc.config.loginBoxLogoUrl || ""}
                    onChange={(e) =>
                      update({
                        config: { ...doc.config, loginBoxLogoUrl: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {doc.template === "seasonal" && (
              <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                <Label className="text-xs uppercase text-muted-foreground">
                  Data comemorativa
                </Label>
                <Select
                  value={doc.config.seasonalTheme || "christmas"}
                  onValueChange={(v) => {
                    const t = v as SeasonalTheme;
                    const p = SEASONAL_PRESETS[t];
                    update({
                      config: {
                        ...doc.config,
                        seasonalTheme: t,
                        seasonalAccent: p.accent,
                        seasonalSecondary: p.secondary,
                        backgroundColor: p.bg,
                      },
                    });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEASONAL_PRESETS).map(([k, p]) => (
                      <SelectItem key={k} value={k}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ColorRow
                  label="Cor principal"
                  value={doc.config.seasonalAccent || "#c1121f"}
                  onChange={(v) => update({ config: { ...doc.config, seasonalAccent: v } })}
                />
                <ColorRow
                  label="Cor secundária"
                  value={doc.config.seasonalSecondary || "#2d6a4f"}
                  onChange={(v) => update({ config: { ...doc.config, seasonalSecondary: v } })}
                />
              </div>
            )}

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
                <LogoUpload
                  value={doc.config.logoUrl}
                  onChange={(url) =>
                    update({
                      config: { ...doc.config, logoUrl: url },
                    })
                  }
                  label="Logo da marca"
                />
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
  total,
  template,
  customFonts,
  onChange,
  onRemove,
  onMove,
}: {
  item: FaqItem;
  index: number;
  total: number;
  template: TemplateKey;
  customFonts?: CustomFont[];
  onChange: (patch: Partial<FaqItem>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            title="Mover para cima"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            title="Mover para baixo"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
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
      <div className="flex items-center justify-between gap-2 rounded-md border border-dashed p-2">
        <Label className="text-[11px] uppercase text-muted-foreground">
          Cor de fundo desta pergunta
        </Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={item.bgColor || "#ffffff"}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="h-7 w-7 cursor-pointer rounded border"
          />
          {item.bgColor && (
            <Button variant="ghost" size="sm" onClick={() => onChange({ bgColor: undefined })}>
              limpar
            </Button>
          )}
        </div>
      </div>
      <FontControls item={item} onChange={onChange} customFonts={customFonts} />

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

function RichMediaHelp() {
  return (
    <div className="space-y-1 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5 font-medium text-foreground">
        <Info className="h-3.5 w-3.5" /> Mídias suportadas
      </div>
      <p><strong>Imagem:</strong> .jpg, .png, .webp, .gif, .svg — até 2&nbsp;MB e 1600&nbsp;px.</p>
      <p><strong>Vídeo:</strong> YouTube/Vimeo ou .mp4/.webm/.ogg — até 50&nbsp;MB.</p>
      <p><strong>Áudio:</strong> .mp3, .wav, .ogg, .m4a — até 20&nbsp;MB.</p>
      <p><strong>Código:</strong> linguagem (HTML, CSS, JS, etc.), layout (bloco/inline/terminal) e tema.</p>
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

/* ---------------- Fontes ---------------- */

function FontControls({
  item,
  onChange,
  customFonts = [],
}: {
  item: FaqItem;
  onChange: (patch: Partial<FaqItem>) => void;
  customFonts?: CustomFont[];
}) {
  const allFonts = [
    ...WEB_FONTS,
    ...customFonts.map((f) => ({ value: f.name, label: `${f.name} (sua fonte)` })),
  ];

  return (
    <div className="space-y-2 rounded-md border border-dashed p-2">
      <Label className="text-[11px] uppercase text-muted-foreground">
        Tipografia
      </Label>
      <div className="grid grid-cols-[1fr_72px] gap-2">
        <Select
          value={item.questionFont || "__default"}
          onValueChange={(v) => onChange({ questionFont: v === "__default" ? undefined : v })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Fonte da pergunta" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {allFonts.map((f) => (
              <SelectItem key={"q-" + (f.value || "default")} value={f.value || "__default"}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={10}
          max={48}
          placeholder="px"
          className="h-8 text-xs"
          value={item.questionFontSize ?? ""}
          onChange={(e) =>
            onChange({
              questionFontSize: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>
      <div className="grid grid-cols-[1fr_72px] gap-2">
        <Select
          value={item.answerFont || "__default"}
          onValueChange={(v) => onChange({ answerFont: v === "__default" ? undefined : v })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Fonte da resposta" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {allFonts.map((f) => (
              <SelectItem key={"a-" + (f.value || "default")} value={f.value || "__default"}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={10}
          max={48}
          placeholder="px"
          className="h-8 text-xs"
          value={item.answerFontSize ?? ""}
          onChange={(e) =>
            onChange({
              answerFontSize: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>
    </div>
  );
}

export function CustomFontsManager({
  fonts,
  onChange,
}: {
  fonts: CustomFont[];
  onChange: (fonts: CustomFont[]) => void;
}) {
  const handleUpload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 4 MB)");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    const format: CustomFont["format"] =
      ext === "woff2"
        ? "woff2"
        : ext === "woff"
          ? "woff"
          : ext === "ttf"
            ? "truetype"
            : ext === "otf"
              ? "opentype"
              : "woff2";
    const mime =
      format === "woff2"
        ? "font/woff2"
        : format === "woff"
          ? "font/woff"
          : format === "truetype"
            ? "font/ttf"
            : "font/otf";
    const buf = await file.arrayBuffer();
    const b64 = btoa(
      new Uint8Array(buf).reduce((acc, b) => acc + String.fromCharCode(b), ""),
    );
    const url = `data:${mime};base64,${b64}`;
    const name = file.name.replace(/\.(woff2?|ttf|otf)$/i, "");
    onChange([...fonts, { name, url, format }]);
    toast.success(`Fonte "${name}" adicionada`);
  };

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
      <Label className="text-xs uppercase text-muted-foreground">
        Fontes personalizadas (paid / branding)
      </Label>
      <p className="text-[11px] text-muted-foreground">
        Envie .woff2, .woff, .ttf ou .otf (até 4 MB). A fonte fica disponível em
        todos os seletores depois.
      </p>
      <input
        type="file"
        accept=".woff2,.woff,.ttf,.otf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = "";
        }}
        className="block w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
      />
      {fonts.length > 0 && (
        <ul className="space-y-1 pt-2">
          {fonts.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded border px-2 py-1 text-xs"
              style={{ fontFamily: `"${f.name}"` }}
            >
              <span>{f.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(fonts.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

