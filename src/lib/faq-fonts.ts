import { useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import type { FaqConfig, FaqItem } from "./faq-types";

/** Fontes gratuitas / nativas mais usadas em sites. */
export const WEB_FONTS: { value: string; label: string; google?: boolean }[] = [
  { value: "", label: "Padrão do modelo" },
  // Google Fonts (gratuitas)
  { value: "Inter", label: "Inter (Google)", google: true },
  { value: "Roboto", label: "Roboto (Google)", google: true },
  { value: "Open Sans", label: "Open Sans (Google)", google: true },
  { value: "Lato", label: "Lato (Google)", google: true },
  { value: "Poppins", label: "Poppins (Google)", google: true },
  { value: "Montserrat", label: "Montserrat (Google)", google: true },
  { value: "Nunito", label: "Nunito (Google)", google: true },
  { value: "Source Sans 3", label: "Source Sans 3 (Google)", google: true },
  { value: "Raleway", label: "Raleway (Google)", google: true },
  { value: "Oswald", label: "Oswald (Google)", google: true },
  { value: "Merriweather", label: "Merriweather (Google)", google: true },
  { value: "Playfair Display", label: "Playfair Display (Google)", google: true },
  { value: "Lora", label: "Lora (Google)", google: true },
  { value: "PT Sans", label: "PT Sans (Google)", google: true },
  { value: "Noto Sans", label: "Noto Sans (Google)", google: true },
  { value: "Work Sans", label: "Work Sans (Google)", google: true },
  { value: "Fira Sans", label: "Fira Sans (Google)", google: true },
  { value: "DM Sans", label: "DM Sans (Google)", google: true },
  { value: "JetBrains Mono", label: "JetBrains Mono (Google)", google: true },
  // Nativas do sistema
  { value: "system-ui", label: "Sistema (system-ui)" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Courier New", label: "Courier New" },
];

const GOOGLE_SET = new Set(WEB_FONTS.filter((f) => f.google).map((f) => f.value));

/** Estilo a aplicar em uma pergunta ou resposta. */
export function itemFontStyle(
  item: FaqItem,
  kind: "question" | "answer",
): CSSProperties {
  const fam = kind === "question" ? item.questionFont : item.answerFont;
  const size = kind === "question" ? item.questionFontSize : item.answerFontSize;
  const style: CSSProperties = {};
  if (fam) style.fontFamily = `"${fam}", system-ui, sans-serif`;
  if (size && size > 0) style.fontSize = `${size}px`;
  return style;
}

/** Mescla utilitário p/ os templates (preserva cores já aplicadas). */
export function mergeStyle(
  ...styles: (CSSProperties | undefined)[]
): CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}

/**
 * Injeta <link> do Google Fonts para as famílias usadas e
 * @font-face para cada fonte personalizada (paga) enviada pelo usuário.
 */
export function FontsLoader({
  items,
  customFonts,
}: {
  items: FaqItem[];
  customFonts?: FaqConfig["customFonts"];
}) {
  const googleFamilies = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.questionFont && GOOGLE_SET.has(it.questionFont))
        set.add(it.questionFont);
      if (it.answerFont && GOOGLE_SET.has(it.answerFont))
        set.add(it.answerFont);
    });
    return Array.from(set);
  }, [items]);

  useEffect(() => {
    if (googleFamilies.length === 0) return;
    const id = "faq-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    const families = googleFamilies
      .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [googleFamilies]);

  useEffect(() => {
    if (!customFonts || customFonts.length === 0) return;
    const id = "faq-custom-fonts";
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = customFonts
      .map(
        (f) =>
          `@font-face{font-family:"${f.name}";src:url("${f.url}") format("${
            f.format || "woff2"
          }");font-display:swap;}`,
      )
      .join("\n");
  }, [customFonts]);

  return null;
}
