export type ColorVariant = { name: string; code: string; imageUrl: string | null };
export type RelatedItem = { name: string; imageUrl: string };
export type LookBlock = { title: string | null; text: string; items: RelatedItem[] };
export type Objection = { question: string; answer: string };

const URL_RE = /https?:\/\/[^\s)]+/gi;
const IMG_EXT_RE = /\.(?:jpe?g|png|webp|gif|avif)/i;

/**
 * Image links in the source data may contain spaces and parentheses
 * (e.g. ".../fondazione nero.PNG" or ".../IALOFANE_10100 (1).jpg").
 * Cut the candidate at its first image extension and percent-encode spaces.
 */
function normalizeImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const start = raw.search(/https?:\/\//i);
  if (start === -1) return null;
  let url = raw.slice(start).trim();
  const ext = url.match(IMG_EXT_RE);
  if (ext && ext.index !== undefined) {
    url = url.slice(0, ext.index + ext[0].length);
  } else {
    url = (url.split(/\s/)[0] ?? "").replace(/[),.;]+$/, "");
  }
  if (!url) return null;
  return url.replace(/\s/g, "%20");
}

function tidy(text: string): string {
  return text
    .replace(/\(\s*\)/g, " ")
    .replace(/\[\s*\]/g, " ")
    .replace(/\s*,\s*\./g, ".")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([a-zа-яё\d])([A-ZА-ЯЁ])/g, "$1 $2")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function stripUrls(raw: string): string {
  return tidy(
    raw
      // word-embed leftovers like `! ({width='0.5in'})` or `![](media/image1.jpg){width=...}`
      .replace(/!\[[^\]]*\]\([^)]*\)\s*(?:\{[^}]*\})?/g, " ")
      .replace(/!\s*\(\s*\{[^}]*\}\s*\)?/g, " ")
      .replace(/\{width=[^}]*\}/g, " ")
      // parenthesised URLs, tolerating one nested level of parentheses and spaces in filenames
      .replace(/\(\s*https?:\/\/[^()]*(?:\([^()]*\)[^()]*)*\)/gi, " ")
      .replace(/\(\s*https?:\/\/[^)]*\)?/gi, " ")
      .replace(URL_RE, " ")
      // leftover filename fragments, e.g. "grigio melange.PNG" or ").jpeg)"
      .replace(/[^\s(]*\.(?:jpe?g|png|webp|gif|avif)\)?/gi, " ")
      .replace(/URL\s+non\s+disponibile/gi, " ")
      .replace(/\(\s*[^()]{0,40}?\)\s*(?=[.,;]|$)/g, (m) => (/[A-Za-zА-Яа-яЁё]{3,}/.test(m) ? m : " "))
      .replace(/\s+\)/g, " ")
      .replace(/\(\s+/g, "("),
  );
}

export function parseColors(raw: string): ColorVariant[] {
  if (!raw) return [];
  return raw
    .split("|")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const idx = chunk.indexOf(":");
      const left = idx === -1 ? chunk : chunk.slice(0, idx);
      const right = idx === -1 ? "" : chunk.slice(idx + 1).trim();
      const m = left.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      const url = normalizeImageUrl(right);
      return {
        name: (m ? (m[1] ?? "") : left).trim(),
        code: m ? (m[2] ?? "").trim() : "",
        imageUrl: url,
      };
    })
    .filter((c) => c.name.length > 0);
}

function extractItems(segment: string): RelatedItem[] {
  const items: RelatedItem[] = [];
  const re =
    /([^,;:.|()]{2,60}?)\s*\((https?:\/\/[^|]*?\.(?:jpe?g|png|webp|gif|avif)|https?:\/\/[^\s)]+)/gi;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = re.exec(segment)) !== null) {
    const url = normalizeImageUrl(m[2]) ?? "";
    let name = tidy(m[1] ?? "");
    // keep only the trailing capitalised product reference, e.g. "юбкой Fumaiolo 3417"
    const capMatch = name.match(/([A-ZА-ЯЁ][^\s]*(?:\s+[A-ZА-ЯЁ][^\s]*)*(?:\s+[\d\s]+)?)\s*$/);
    if (capMatch) name = (capMatch[1] ?? "").trim();
    name = name.replace(/\s{2,}/g, " ").trim();
    if (!name || !url || seen.has(url)) continue;
    seen.add(url);
    items.push({ name, imageUrl: url });
  }
  return items;
}

export function parseStylingText(rawText: string): LookBlock[] {
  if (!rawText) return [];
  const segments = rawText
    .split(/\s\|\s|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return segments
    .map((segment) => {
      const items = extractItems(segment);
      const clean = stripUrls(segment);
      let title: string | null = null;
      let text = clean;
      const idx = clean.indexOf(":");
      if (idx > 0 && idx < 60) {
        title = clean.slice(0, idx).trim();
        text = clean.slice(idx + 1).trim();
      } else {
        const lm = clean.match(/^((?:Total\s+Look|Look|Vetrina|Витрина)[^\s.]*\s*[^\s.]*)/i);
        const lead = lm?.[1] ?? "";
        if (lead) {
          title = lead.trim();
          text = clean.slice(lead.length).trim();
        }
      }
      return { title, text, items };
    })
    .filter((b) => b.text.length > 0 || b.items.length > 0);
}

export function parseSalesTips(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/\s\|\s|\|/)
    .map((s) => stripUrls(s))
    .filter(Boolean);
}

export function parseObjections(raw: string): Objection[] {
  if (!raw) return [];
  // placeholder cells ("Data not available" / "Данные отсутствуют") carry no content
  const stripped = raw
    .replace(/возражени[ея]|стратегия\s+\S+|преодоления|objection|overcoming|strategy/gi, "")
    .trim();
  if (stripped.length === 0) return [];
  if (/^(?:данные\s+отсутствуют|data\s+not\s+available)\b/i.test(stripped) && !/«|->|→/.test(raw)) return [];
  // Format A: inline "Objection: «...» Response: ..." pairs (possibly several in one cell)
  if (/objection\s*:/i.test(raw)) {
    return raw
      .split(/objection\s*:/i)
      .map((s) => s.trim())
      .filter((s) => Boolean(s) && !/objection\s*handling/i.test(s) && !/^\d+\s*[.)]\s*$/.test(s))
      .map((chunk) => {
        const m = chunk.match(/^([\s\S]*?)\s*response\s*:\s*([\s\S]*)$/i);
        if (!m) return { question: stripUrls(chunk), answer: "" };
        return {
          question: stripUrls(m[1] ?? "").replace(/^[«"'\s]+|[»"'\s]+$/g, ""),
          answer: stripUrls(m[2] ?? ""),
        };
      })
      .filter((o) => o.question.length > 0 || o.answer.length > 0);
  }
  // Format B: flattened two-column table — questions inside «...», answers in between
  if (/«[\s\S]+?»/.test(raw)) {
    const body = raw
      .replace(/^\s*(?:\d+\s*[.)]\s*)?(?:objection(?:\s+handling)?|возражени[ея])[\s\S]{0,40}?(?=«)/i, "")
      .replace(/возражение\s+стратегия\s+преодоления/gi, " ");
    const out: Objection[] = [];
    const re = /«([\s\S]*?)»\s*([^«]*)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
      const question = stripUrls(m[1] ?? "").replace(/^[«"'\s]+|[»"'\s]+$/g, "");
      const answer = stripUrls(m[2] ?? "");
      if (question || answer) out.push({ question, answer });
    }
    // nested «word» quotes inside an answer split it into a stub pair:
    // when an objection has no answer and the next "question" is a short
    // quoted phrase, fold it back: answer = «phrase» + its text
    for (let i = out.length - 1; i >= 0; i--) {
      const cur = out[i]!;
      const next = out[i + 1];
      if (cur.question && !cur.answer && next && next.question.split(/\s+/).length <= 4) {
        cur.answer = tidy(`«${next.question}» ${next.answer}`);
        out.splice(i + 1, 1);
      }
    }
    if (out.length > 0) return out;
  }
  // Format C: "question -> answer" pairs separated by ||
  return raw
    .split(/\|\|/)
    .map((s) => s.trim().replace(/^[,;]\s*/, ""))
    .filter(Boolean)
    .map((chunk) => {
      const m = chunk.match(/^\s*\[?([\s\S]*?)\]?\s*(?:->|→)\s*([\s\S]*)$/);
      if (!m) return { question: stripUrls(chunk), answer: "" };
      return { question: stripUrls(m[1] ?? ""), answer: stripUrls(m[2] ?? "") };
    })
    .filter((o) => o.question.length > 0);
}

export type Category = "knitwear" | "outerwear" | "dresses" | "trousers" | "skirts" | "shirts" | "accessories" | "other";

export function inferCategory(descEn: string): Category {
  const d = descEn.toLowerCase();
  if (/(coat|jacket|blazer|parka|cape|trench)/.test(d)) return "outerwear";
  if (/(dress|gown|jumpsuit)/.test(d)) return "dresses";
  if (/(trouser|pant\b|pants|leggings)/.test(d)) return "trousers";
  if (/(skirt)/.test(d)) return "skirts";
  if (/(shirt|blouse|top\b)/.test(d)) return "shirts";
  if (/(bag|shoe|pump|boot|bracelet|necklace|earring|belt|scarf|jewel)/.test(d)) return "accessories";
  if (/(knit|pullover|cardigan|sweater|jumper|yarn)/.test(d)) return "knitwear";
  return "other";
}
