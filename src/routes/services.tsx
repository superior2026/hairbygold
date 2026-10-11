import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { useQuery } from "@tanstack/react-query";
import { servicePhotosQuery } from "@/lib/catalog";
import { services } from "@/lib/salon-data";
import { submitBooking } from "@/lib/studio.functions";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Salon Services — Hair by Gold Beauty Hub & Spa" },
      {
        name: "description",
        content:
          "Wig and frontal installations, closures, revamps, bridal and birthday hair, ponytails, natural hair styling and home service by Hair by Gold.",
      },
      { property: "og:title", content: "Salon Services — Hair by Gold Beauty Hub & Spa" },
      {
        property: "og:description",
        content:
          "Installations, revamps, bridal and birthday hair, ponytails, natural hair styling and home service.",
      },
    ],
  }),
  component: Services,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  contact: z.string().trim().min(6, "Add a phone number or email").max(120),
  date: z.string().trim().min(1, "Choose a preferred date"),
  time: z.string().trim().min(1, "Choose a preferred time"),
  notes: z.string().trim().max(500),
});

function ServiceCardSkeleton() {
  return (
    <div className="space-y-4 rounded-sm border border-border p-4">
      <Skeleton className="aspect-[4/3] w-full rounded-sm" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-10 w-28 rounded-sm" />
    </div>
  );
}

function Services() {
  const loading = useFakeLoading(900);
  const photos = useQuery(servicePhotosQuery).data ?? {};
  const saveBooking = useServerFn(submitBooking);
  const { session } = useSession();
  const [booking, setBooking] = useState<string | null>(null);
  const bookingService = services.find((x) => x.name === booking);
  const [values, setValues] = useState({ name: "", contact: "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");

  function openBooking(serviceName: string) {
    setBooking(serviceName);
    setErrors({});
    setSent(false);
    setFailed("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setFailed("");
    setBusy(true);
    try {
      await saveBooking({
        data: {
          service_name: booking ?? "Appointment",
          customer_name: parsed.data.name,
          contact: parsed.data.contact,
          preferred_date: parsed.data.date,
          preferred_time: parsed.data.time,
          notes: parsed.data.notes,
        },
      });
      setSent(true);
      setValues((v) => ({ name: v.name, contact: "", date: "", time: "", notes: "" }));
    } catch {
      setFailed("We couldn't send that just now. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
      <header className="max-w-2xl">
        <p className="text-[0.62rem] tracking-luxe text-primary">Beauty hub &amp; spa</p>
        <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
          Services at the <span className="text-gradient-gold">gold standard</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Every appointment includes a consultation, a wash-and-treat where needed and a finish
          set for real life. Prices shown are starting points.
        </p>
        <p className="mt-3 text-sm text-foreground">Contact us for current pricing.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/gallery"
            className="inline-flex h-11 items-center gap-2 rounded-sm border border-input px-5 text-sm transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            See featured hairstyles
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            to="/chat"
            className="inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Ask a stylist
          </Link>
        </div>
      </header>

      <div className="mt-14" aria-busy={loading}>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li
                key={s.id}
                className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft transition hover:border-primary/60 hover:shadow-lift"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={photos[s.id] ?? s.image}
                    alt={s.imageAlt}
                    loading="lazy"
                    width={896}
                    height={1120}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm bg-background/90 px-2.5 py-1 text-[0.62rem] tracking-luxe text-foreground">
                    <Clock className="size-3" aria-hidden="true" />
                    {s.duration}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-2xl">{s.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                  <p className="mt-4 text-sm">
                    {s.from ? (
                      <span className="font-display text-xl text-primary">From ${s.from}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-primary">
                        <Sparkles className="size-4" aria-hidden="true" />
                        Custom quote
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Contact us for current pricing.
                  </p>
                  <Button className="mt-5 self-start" onClick={() => openBooking(s.name)}>
                    Book Now
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={booking !== null} onOpenChange={(o) => setBooking(o ? booking : null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            {bookingService ? (
              <img
                src={photos[bookingService.id] ?? bookingService.image}
                alt={bookingService.imageAlt}
                className="mb-2 aspect-[16/9] w-full rounded-sm object-cover"
              />
            ) : null}
            <DialogTitle className="font-display text-2xl">
              Book {booking ?? "an appointment"}
            </DialogTitle>
            <DialogDescription>
              Send a request and the studio will confirm your slot and current pricing.
            </DialogDescription>
          </DialogHeader>

          {!session ? (
            <div className="rounded-sm border border-border p-6 text-center text-sm">
              <p>Sign in to book — your bookings are saved to your account.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Link to="/login" className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-primary-foreground">
                  Sign in
                </Link>
                <Link to="/signup" className="inline-flex h-10 items-center rounded-sm border border-input px-4 hover:bg-secondary">
                  Create account
                </Link>
              </div>
            </div>
          ) : sent ? (
            <div className="rounded-sm border border-primary/40 bg-primary/5 p-6 text-center">
              <CheckCircle2 className="mx-auto size-7 text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-xl">Inquiry received</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you, {values.name.split(" ")[0]} — we'll reach out to confirm your{" "}
                {booking?.toLowerCase()} appointment and share current pricing.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button asChild>
                  <Link to="/book" search={{ service: booking ?? undefined }}>Pick a time on the calendar</Link>
                </Button>
                <Button variant="outline" onClick={() => setBooking(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <Label htmlFor="bk-name">Full name</Label>
                <Input
                  id="bk-name"
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  aria-invalid={Boolean(errors["name"])}
                  aria-describedby={errors["name"] ? "bk-name-err" : undefined}
                  className="mt-2"
                />
                {errors["name"] ? (
                  <p id="bk-name-err" className="mt-1 text-xs text-destructive">
                    {errors["name"]}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="bk-contact">Phone or email</Label>
                <Input
                  id="bk-contact"
                  value={values.contact}
                  onChange={(e) => setValues((v) => ({ ...v, contact: e.target.value }))}
                  aria-invalid={Boolean(errors["contact"])}
                  aria-describedby={errors["contact"] ? "bk-contact-err" : undefined}
                  className="mt-2"
                />
                {errors["contact"] ? (
                  <p id="bk-contact-err" className="mt-1 text-xs text-destructive">
                    {errors["contact"]}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="bk-date">Preferred date</Label>
                <Input
                  id="bk-date"
                  type="date"
                  value={values.date}
                  onChange={(e) => setValues((v) => ({ ...v, date: e.target.value }))}
                  aria-invalid={Boolean(errors["date"])}
                  aria-describedby={errors["date"] ? "bk-date-err" : undefined}
                  className="mt-2"
                />
                {errors["date"] ? (
                  <p id="bk-date-err" className="mt-1 text-xs text-destructive">
                    {errors["date"]}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="bk-time">Preferred time</Label>
                <Input
                  id="bk-time"
                  type="time"
                  value={values.time}
                  onChange={(e) => setValues((v) => ({ ...v, time: e.target.value }))}
                  aria-invalid={Boolean(errors["time"])}
                  className="mt-2"
                />
                {errors["time"] ? (
                  <p className="mt-1 text-xs text-destructive">{errors["time"]}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="bk-notes">Anything we should know? (optional)</Label>
                <Textarea
                  id="bk-notes"
                  rows={3}
                  value={values.notes}
                  onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
                  className="mt-2"
                />
              </div>
              {failed ? (
                <p role="alert" className="text-sm text-destructive">
                  {failed}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Send inquiry"}
                </Button>
                <Link
                  to="/help"
                  className="rounded-sm text-sm text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Or contact support
                </Link>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
