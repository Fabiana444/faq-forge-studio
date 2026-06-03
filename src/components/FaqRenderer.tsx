import type { FaqConfig, FaqItem, TemplateKey } from "@/lib/faq-types";
import { CategorizedFaq } from "./faq-templates/CategorizedFaq";
import { ShareableFaq } from "./faq-templates/ShareableFaq";
import { RichMediaFaq } from "./faq-templates/RichMediaFaq";
import { PrivateFaq } from "./faq-templates/PrivateFaq";
import { BrandedFaq } from "./faq-templates/BrandedFaq";
import { NumberedFaq } from "./faq-templates/NumberedFaq";
import { SeasonalFaq } from "./faq-templates/SeasonalFaq";

export function FaqRenderer({
  template,
  items,
  config,
  isAuthenticated = false,
}: {
  template: TemplateKey;
  items: FaqItem[];
  config: FaqConfig;
  isAuthenticated?: boolean;
}) {
  switch (template) {
    case "categorized":
      return <CategorizedFaq items={items} config={config} />;
    case "shareable":
      return <ShareableFaq items={items} config={config} />;
    case "rich-media":
      return <RichMediaFaq items={items} config={config} />;
    case "private":
      return (
        <PrivateFaq
          items={items}
          config={config}
          isAuthenticated={isAuthenticated}
        />
      );
    case "branded":
      return <BrandedFaq items={items} config={config} />;
    case "numbered":
      return <NumberedFaq items={items} config={config} />;
    case "seasonal":
      return <SeasonalFaq items={items} config={config} />;
  }
}
