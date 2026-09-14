import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  ImageOff,
  MessageCircleQuestion,
  Shirt,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import {
  inferCategory,
  parseColors,
  parseObjections,
  parseSalesTips,
  parseStylingText,
} from "@/lib/parse";
import type { ModelRow } from "@/data/models";

const tipIcons = [Sparkles, Award, TrendingUp];

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 font-display text-xl font-semibold tracking-wide text-foreground">
      <span className="mr-2 inline-block h-px w-8 align-middle bg-gold" />
      {children}
    </h2>
  );
}

function Thumb({
  src,
  alt,
  onZoom,
  className = "aspect-[3/4]",
}: {
  src: string | null;
  alt: string;
  onZoom?: (src: string) => void;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`${className} flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-secondary p-3 text-center`}
      >
        <Shirt className="h-6 w-6 text-gold" aria-hidden />
        <span className="text-[11px] font-medium whitespace-normal break-words text-muted-foreground">
          {alt}
        </span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onZoom?.(src)}
      className={`${className} w-full overflow-hidden rounded-lg border border-border bg-card`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </button>
  );
}

export function ModelSheet({ model }: { model: ModelRow }) {
  const { lang, t, tc } = useLang();
  const [zoom, setZoom] = useState<string | null>(null);

  const colors = useMemo(() => parseColors(model.colors), [model]);
  const looks = useMemo(() => parseStylingText(model.styling), [model]);
  const tips = useMemo(
    () => parseSalesTips(lang === "en" ? model.salesEn : model.salesRu),
    [model, lang],
  );
  const objections = useMemo(
    () => parseObjections(lang === "en" ? model.objEn : model.objRu),
    [model, lang],
  );
  const category = useMemo(() => inferCategory(model.descEn), [model]);
  const hero = colors.find((c) => c.imageUrl)?.imageUrl ?? null;
  const description = lang === "en" ? model.descEn : model.descRu;

  return (
    <article className="space-y-10 overflow-visible pb-16">
      <header className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-luxe">
          <div className="relative">
            {hero ? (
              <img
                src={hero}
                alt={model.name}
                className="max-h-[420px] w-full object-cover"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center bg-secondary">
                <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden />
              </div>
            )}
            <span className="absolute top-3 left-3 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary-foreground uppercase">
              {tc(category)}
            </span>
          </div>
          <div className="px-4 py-4">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-gold uppercase">
              {t("analysis")}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-wide break-words text-foreground">
              {model.name}
            </h1>
          </div>
        </div>
      </header>

      <section>
        <SectionTitle>{t("description")}</SectionTitle>
        <p className="overflow-visible text-sm leading-relaxed whitespace-normal break-words text-foreground/85">
          {description}
        </p>
      </section>

      {colors.length > 0 && (
        <section>
          <SectionTitle>{t("colors")}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {colors.map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-luxe"
              >
                <Thumb src={c.imageUrl} alt={c.name} onZoom={setZoom} />
                <div className="px-1 pt-2 pb-1">
                  <p className="text-sm font-medium whitespace-normal break-words text-foreground">
                    {c.name}
                  </p>
                  {c.code && <p className="text-xs text-gold">({c.code})</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle>{t("styling")}</SectionTitle>
        {looks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noStyling")}</p>
        ) : (
          <div className="space-y-4">
            {looks.map((look, i) => (
              <div
                key={i}
                className="h-auto overflow-visible rounded-xl border border-border bg-card p-4 shadow-luxe"
              >
                <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
                  {look.title ?? `${t("look")} ${i + 1}`}
                </p>
                <p className="text-sm leading-relaxed whitespace-normal break-words text-foreground/85">
                  {look.text}
                </p>
                {look.items.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      {t("matchingPieces")}
                    </p>
                    <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
                      {look.items.map((item, j) => (
                        <div key={j} className="w-28 shrink-0 snap-start">
                          <Thumb
                            src={item.imageUrl}
                            alt={item.name}
                            onZoom={setZoom}
                            className="aspect-[3/4]"
                          />
                          <p className="mt-1 text-[11px] leading-snug whitespace-normal break-words text-muted-foreground">
                            {item.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {tips.length > 0 && (
        <section>
          <SectionTitle>{t("sales")}</SectionTitle>
          <div className="space-y-3">
            {tips.map((tip, i) => {
              const Icon = tipIcons[i % tipIcons.length] ?? Sparkles;
              return (
                <div
                  key={i}
                  className="h-auto overflow-visible rounded-xl border border-gold/40 bg-card p-4 shadow-luxe"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                    <span className="font-display text-lg font-semibold text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-normal break-words text-foreground/85">
                    {tip}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {objections.length > 0 && (
        <section>
          <SectionTitle>{t("objections")}</SectionTitle>
          <Accordion type="multiple" className="space-y-3">
            {objections.map((o, i) => (
              <AccordionItem
                key={i}
                value={`obj-${i}`}
                className="h-auto overflow-visible rounded-xl border border-border bg-card px-4 shadow-luxe"
              >
                <AccordionTrigger className="items-start gap-3 py-4 text-left hover:no-underline">
                  <span className="flex min-w-0 items-start gap-2">
                    <MessageCircleQuestion
                      className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux"
                      aria-hidden
                    />
                    <span className="text-sm font-semibold whitespace-normal break-words text-foreground">
                      {o.question}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="overflow-visible pb-4">
                  <div className="rounded-lg border-l-2 border-gold bg-accent/40 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                      <span className="text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
                        {t("yourAnswer")}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-normal break-words text-foreground/80">
                      {o.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      <Dialog open={!!zoom} onOpenChange={(open) => !open && setZoom(null)}>
        <DialogContent className="max-w-[92vw] border-border bg-card p-2 sm:max-w-lg">
          {zoom && <img src={zoom} alt={model.name} className="w-full rounded-md object-contain" />}
        </DialogContent>
      </Dialog>
    </article>
  );
}
