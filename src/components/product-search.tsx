import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCatalog } from "@/lib/catalog";
import { currency } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductSearch({
  className,
  placeholder = "Search wigs, bundles, care…",
  value,
  onValueChange,
  onSubmitQuery,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  onSubmitQuery?: (v: string) => void;
}) {
  const navigate = useNavigate();
  const listId = useId();
  const [inner, setInner] = useState("");
  const query = value ?? inner;
  const setQuery = onValueChange ?? setInner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const products = useCatalog();
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.texture.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [products, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    setActive(-1);
    navigate({ to: "/product/$productId", params: { productId: id } });
  };

  const showList = open && matches.length > 0;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && matches[active]) return go(matches[active].id);
          setOpen(false);
          onSubmitQuery?.(query);
          if (!onSubmitQuery) navigate({ to: "/explore", search: { q: query } });
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search products
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value.slice(0, 80));
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(matches.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-11 w-full rounded-sm border border-input bg-card pl-9 pr-9 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </form>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Product suggestions"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-sm border border-border bg-popover shadow-lift"
        >
          {matches.map((p, i) => (
            <li key={p.id} id={`${listId}-opt-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                  i === active ? "bg-secondary" : "hover:bg-secondary",
                )}
              >
                <img
                  src={p.image}
                  alt=""
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="size-10 shrink-0 rounded-sm object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{p.category}</span>
                </span>
                <span className="text-sm">{currency(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
