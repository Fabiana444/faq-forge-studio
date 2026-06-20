import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FaqItem } from "@/lib/faq-types";

interface SearchFaqProps {
  items: FaqItem[];
  onSelect: (item: FaqItem) => void;
}

/**
 * Fase 4: Componente de busca global que filtra perguntas e respostas
 * em tempo real conforme o usuário digita.
 */
export function SearchFaq({ items, onSelect }: SearchFaqProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [query, items]);

  const handleSelect = (item: FaqItem) => {
    onSelect(item);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar perguntas..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-10 pr-8"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
          {results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">
                        {item.question}
                      </p>
                      {item.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Categoria: {item.category}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.answer.replace(/<[^>]*>/g, "")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma pergunta encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
}
