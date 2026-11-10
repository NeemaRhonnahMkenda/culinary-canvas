/**
 * Turns a plain-text recipe into readable sections:
 *  "Ingredients" / "Method" style lines become headings,
 *  "- item" lines become a bulleted list, "1. step" lines a numbered list.
 * Everything is rendered as text (never HTML), so user input can't inject markup.
 */
const HEADING = /^(ingredients|method|instructions|directions|steps|notes?|tips?|description|for the [\w\s]+|[A-Z][A-Z\s&/'-]{3,40}):?$/i;

type Block =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const step = /^\d+[.)]\s+(.*)$/.exec(line);
    const last = blocks.at(-1);
    if (bullet) {
      if (last?.kind === "ul") last.items.push(bullet[1]);
      else blocks.push({ kind: "ul", items: [bullet[1]] });
    } else if (step) {
      if (last?.kind === "ol") last.items.push(step[1]);
      else blocks.push({ kind: "ol", items: [step[1]] });
    } else if (HEADING.test(line) && line.length < 45) {
      blocks.push({ kind: "h", text: line.replace(/:$/, "") });
    } else {
      blocks.push({ kind: "p", text: line });
    }
  }
  return blocks;
}

export default function RecipeText({ text }: { text: string }) {
  return (
    <div className="recipe-text space-y-4 text-base leading-relaxed">
      {parse(text).map((b, i) =>
        b.kind === "h" ? (
          <h3 key={i} className="pt-3 font-cc-display text-[22px] text-cc-ink first:pt-0">
            {b.text.charAt(0).toUpperCase() + b.text.slice(1).toLowerCase()}
          </h3>
        ) : b.kind === "p" ? (
          <p key={i}>{b.text}</p>
        ) : b.kind === "ul" ? (
          <ul key={i} className="space-y-1.5">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-3">
                <span className="mt-[11px] h-px w-3 shrink-0 bg-cc-accent" aria-hidden />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ol key={i} className="space-y-3">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-3">
                <span className="w-5 shrink-0 font-bold text-cc-accent">{j + 1}.</span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
