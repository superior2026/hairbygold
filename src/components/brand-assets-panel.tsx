import { Info, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ACCEPTED_IMAGE_TYPES,
  DEFAULT_BRAND,
  readFileAsDataUrl,
  resetAllBrandAssets,
  resetBrandAsset,
  setBrandAsset,
  useBrandAssets,
  validateImageFile,
  type BrandSlot,
} from "@/lib/brand-assets";

const slots: { slot: BrandSlot; label: string; help: string; dark: boolean }[] = [
  {
    slot: "logoLight",
    label: "Light theme logo",
    help: "Shown on cream backgrounds. Use dark lettering for readability.",
    dark: false,
  },
  {
    slot: "logoDark",
    label: "Dark theme logo",
    help: "Shown on espresso backgrounds. Use light lettering for readability.",
    dark: true,
  },
  {
    slot: "favicon",
    label: "Tab icon (favicon)",
    help: "Square, high-contrast mark. Stays legible on any browser background.",
    dark: true,
  },
];

function SlotRow({
  slot,
  label,
  help,
  dark,
  src,
}: {
  slot: BrandSlot;
  label: string;
  help: string;
  dark: boolean;
  src: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isCustom = src !== DEFAULT_BRAND[slot];

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const problem = validateImageFile(file);
    setError(problem);
    if (problem) return;
    try {
      setBrandAsset(slot, await readFileAsDataUrl(file));
      toast.success(`${label} updated on this browser`);
    } catch {
      setError("Could not read that file.");
    }
  };

  return (
    <li className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <Label htmlFor={`brand-${slot}`}>{label}</Label>
        <p id={`brand-${slot}-help`} className="mt-1 text-xs text-muted-foreground">
          {help} PNG, JPG, WEBP or SVG · up to 512 KB.
        </p>
        <div
          className={
            dark
              ? "mt-3 flex h-16 items-center justify-center rounded-sm bg-ink p-3"
              : "mt-3 flex h-16 items-center justify-center rounded-sm bg-background p-3 ring-1 ring-border"
          }
        >
          <img
            src={src}
            alt={`${label} preview`}
            className={slot === "favicon" ? "h-10 w-10 object-contain" : "h-full w-auto max-w-full object-contain"}
          />
        </div>
        <input
          ref={inputRef}
          id={`brand-${slot}`}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          aria-describedby={`brand-${slot}-help`}
          aria-invalid={!!error}
          className="mt-3 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-sm file:border file:border-border file:bg-secondary file:px-3 file:py-2 file:text-xs file:text-secondary-foreground"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        {error ? (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 sm:self-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" aria-hidden="true" />
          Upload
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!isCustom}
          onClick={() => {
            resetBrandAsset(slot);
            setError(null);
            if (inputRef.current) inputRef.current.value = "";
            toast.success(`${label} reset to default`);
          }}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset
        </Button>
      </div>
    </li>
  );
}

export function BrandAssetsPanel() {
  const brand = useBrandAssets();

  return (
    <section className="space-y-4 rounded-sm border border-border bg-card p-7">
      <h2 className="font-display text-2xl">Brand assets</h2>
      <p className="flex items-start gap-2 rounded-sm bg-secondary p-4 text-xs text-secondary-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Demo only — these logos are saved in this browser alone. They are not shared with
          other people, devices or visitors, and they are not stored permanently until cloud
          storage is enabled. Clearing your browser data removes them.
        </span>
      </p>
      <ul className="divide-y divide-border">
        {slots.map((s) => (
          <SlotRow key={s.slot} {...s} src={brand[s.slot]} />
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          resetAllBrandAssets();
          toast.success("All brand assets reset to default");
        }}
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset all to defaults
      </Button>
    </section>
  );
}
