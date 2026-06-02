import type { CSSProperties } from "react";

/**
 * Renderiza HTML simples salvo no campo de resposta.
 * Permite apenas as tags do toolbar (b, strong, i, em, u, a, br) — o resto é escapado.
 */
const ALLOWED = /<\/?(b|strong|i|em|u|a|br)(\s+[^>]*)?>/gi;

function sanitize(html: string) {
  if (!html) return "";
  // remove eventos inline e javascript: hrefs
  const cleaned = html
    .replace(/ on\w+="[^"]*"/gi, "")
    .replace(/ on\w+='[^']*'/gi, "")
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
  // mantém apenas tags permitidas
  const out: string[] = [];
  let last = 0;
  for (const m of cleaned.matchAll(/<[^>]+>/g)) {
    out.push(cleaned.slice(last, m.index));
    const tag = m[0];
    if (ALLOWED.test(tag)) {
      ALLOWED.lastIndex = 0;
      // força target/rel seguros em <a>
      if (/^<a\b/i.test(tag)) {
        const safe = tag
          .replace(/\s*target="[^"]*"/i, "")
          .replace(/\s*rel="[^"]*"/i, "")
          .replace(/<a\b/i, '<a target="_blank" rel="noopener noreferrer"');
        out.push(safe);
      } else {
        out.push(tag);
      }
    }
    last = (m.index ?? 0) + tag.length;
  }
  out.push(cleaned.slice(last));
  return out.join("");
}

export function RichText({
  html,
  className,
  style,
}: {
  html: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}
