import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LogoUploadProps {
  value: string | undefined;
  onChange: (url: string) => void;
  label?: string;
}

/**
 * Fase 5: Componente para upload de logo com preview.
 * Valida tamanho e tipo de arquivo.
 */
export function LogoUpload({ value, onChange, label = "Logo" }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 5MB)");
      return;
    }

    setLoading(true);
    try {
      // Converter para Data URL (para desenvolvimento local)
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        onChange(dataUrl);
        toast.success("Logo atualizada");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Erro ao processar imagem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Logo preview"
                className="h-16 w-auto max-w-xs rounded-lg border border-border object-contain"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  onChange("");
                }}
                className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="flex h-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="text-center">
                <Upload className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-1">Clique para upload</p>
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        PNG, JPG ou GIF. Máx 5MB. Recomendado: 200x60px
      </p>
    </div>
  );
}
