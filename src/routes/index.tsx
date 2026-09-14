import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LanguageProvider, useLang, type Lang } from "@/lib/i18n";
import { models } from "@/data/models";
import { ModelSheet } from "@/components/training/ModelSheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luisa Spagnoli — Training Material FW 2026/2027" },
      {
        name: "description",
        content:
          "Bilingual retail training sheets for the Luisa Spagnoli Fall Winter 2026/2027 collection: descriptions, colour variants, total looks, sales advice and objection handling.",
      },
      { property: "og:title", content: "Luisa Spagnoli — Training Material FW 2026/2027" },
      {
        property: "og:description",
        content:
          "Retail training app for the Luisa Spagnoli Fall Winter 2026/2027 collection, in English and Russian.",
      },
    ],
  }),
  component: () => (
    <LanguageProvider>
      <TrainingApp />
    </LanguageProvider>
  ),
});

function LangToggle() {
  const { lang, setLang } = useLang();
  const options: Lang[] = ["en", "ru"];
  return (
    <div className="flex shrink-0 items-center rounded-full border border-gold/50 bg-card p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => setLang(o)}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest uppercase transition-colors ${
            lang === o ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function TrainingApp() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const model = useMemo(() => models.find((m) => m.id === selected) ?? null, [selected]);
  const pendingModel = useMemo(() => models.find((m) => m.id === pending) ?? null, [pending]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold tracking-[0.3em] text-foreground">
              LUISA SPAGNOLI
            </p>
            <p className="mt-0.5 text-[11px] leading-snug whitespace-normal break-words text-muted-foreground">
              {t("title")}
            </p>
          </div>
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-xl border border-border bg-card p-4 shadow-luxe">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="h-11 w-full justify-between border-border bg-background text-left font-normal"
              >
                <span className="truncate">{pendingModel?.name ?? t("selectModel")}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[calc(100vw-3rem)] p-0 sm:w-[420px]"
            >
              <Command>
                <CommandInput placeholder={t("searchPlaceholder")} />
                <CommandList className="max-h-72">
                  <CommandEmpty>—</CommandEmpty>
                  <CommandGroup>
                    {models.map((m) => (
                      <CommandItem
                        key={m.id}
                        value={m.name}
                        onSelect={() => {
                          setPending(m.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${pending === m.id ? "opacity-100" : "opacity-0"}`}
                        />
                        {m.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            disabled={!pending}
            onClick={() => setSelected(pending)}
            className="mt-3 h-11 w-full rounded-md border border-gold/60 bg-primary text-[12px] font-semibold tracking-[0.28em] text-primary-foreground uppercase hover:bg-primary/90"
          >
            <Search className="mr-2 h-4 w-4 text-gold" />
            {t("search")}
          </Button>

          <p className="mt-3 text-center text-[11px] tracking-wide text-muted-foreground">
            {models.length} {t("models")}
          </p>
        </div>

        <div className="mt-8">
          {model ? (
            <ModelSheet key={model.id} model={model} />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">{t("emptyState")}</p>
          )}
        </div>
      </main>
    </div>
  );
}
