import { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import type { FaqConfig, FaqItem, TemplateKey } from "@/lib/faq-types";
import { CategorizedFaq } from "./CategorizedFaq";
import { ShareableFaq } from "./ShareableFaq";
import { RichMediaFaq } from "./RichMediaFaq";
import { PrivateFaq } from "./PrivateFaq";
import { BrandedFaq } from "./BrandedFaq";
import { NumberedFaq } from "./NumberedFaq";
import { SeasonalFaq } from "./SeasonalFaq";

/**
 * Fase 6: FAQ com Tabs no Topo.
 * O campo 'category' dos itens é usado para definir as abas.
 * O usuário pode configurar qual template cada aba usa via config.tabTemplates.
 */
export function TabsFaq({
  items,
  config,
  isAuthenticated = false,
}: {
  items: FaqItem[];
  config: FaqConfig & { tabTemplates?: Record<string, TemplateKey> };
  isAuthenticated?: boolean;
}) {
  // Extrair categorias únicas para as abas
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((it) => it.category || "Geral")));
    return cats;
  }, [items]);

  const [activeTab, setActiveTab] = useState(categories[0] || "Geral");

  // Filtrar itens da aba ativa
  const activeItems = useMemo(() => {
    return items.filter((it) => (it.category || "Geral") === activeTab);
  }, [items, activeTab]);

  // Determinar qual template usar para esta aba (padrão: categorized)
  const activeTemplate = (config.tabTemplates?.[activeTab] || "categorized") as TemplateKey;

  const renderInnerFaq = () => {
    // FAQ Menu não pode conter outro FAQ Menu (hierarquia)
    if (activeTemplate === "menu" || activeTemplate === "tabs") {
      return <CategorizedFaq items={activeItems} config={config} />;
    }

    switch (activeTemplate) {
      case "categorized":
        return <CategorizedFaq items={activeItems} config={config} />;
      case "shareable":
        return <ShareableFaq items={activeItems} config={config} />;
      case "rich-media":
        return <RichMediaFaq items={activeItems} config={config} />;
      case "private":
        return <PrivateFaq items={activeItems} config={config} isAuthenticated={isAuthenticated} />;
      case "branded":
        return <BrandedFaq items={activeItems} config={config} />;
      case "numbered":
        return <NumberedFaq items={activeItems} config={config} />;
      case "seasonal":
        return <SeasonalFaq items={activeItems} config={config} />;
      default:
        return <CategorizedFaq items={activeItems} config={config} />;
    }
  };

  return (
    <div className="space-y-6 rounded-2xl p-6" style={{ background: config.backgroundColor }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Menu</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{activeTab}</span>
      </nav>

      {/* Tabs no Topo */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === cat
                ? "shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            style={{
              background: activeTab === cat ? config.accentColor : "transparent",
              color: activeTab === cat ? "#fff" : undefined,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Conteúdo da FAQ */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {renderInnerFaq()}
      </div>
    </div>
  );
}
