import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { services } from "@/lib/salon-data";
import { submitBooking } from "@/lib/studio.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book")({
  validateSearch: z.object({ service: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Book an Appointment — Hair by Gold" },
      { name: "description", content: "Pick a service, a day and a time slot to book your Hair by Gold appointment." },
      { property: "og:title", content: "Book an Appointment — Hair by Gold" },
      { property: "og:description", content: "Choose a date and time — bookings open 24/7." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookPage,
});

const slots = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function BookPage() {
  const search = Route.useSearch();
  const { session, ready } = useSession();
  const [service, setService] = useState(
    services.find((s) => s.name === search.service)?.name ?? services[0]!.name,
  );
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return setError("Pick a day and a time slot.");
    if (name.trim().length < 2) return setError("Enter your name.");
    if (contact.trim().length < 5) return setError("Enter a phone number or email.");
    setError("");
    setBusy(true);
    try {
      await submitBooking({
        data: { service_name: service, customer_name: name, contact, preferred_date: toIso(date), preferred_time: time, notes },
      });
      setDone(true);
    } catch {
      setError("We couldn't save that booking. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <p className="text-[0.62rem] tracking-luxe text-primary">Appointments</p>
      <h1 className="mt-4 font-display text-5xl">Book an appointment</h1>
      <p className="mt-3 text-sm text-muted-foreground">Open 24/7 — pick any day and time that suits you.</p>

      {!ready ? null : !session ? (
        <div className="mt-10 rounded-sm border border-border bg-card p-8 text-center text-sm">
          <p>Sign in to book — your appointments are saved to your account.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild><Link to="/login">Sign in</Link></Button>
            <Button asChild variant="outline"><Link to="/signup">Create account</Link></Button>
          </div>
        </div>
      ) : done ? (
        <div role="status" className="mt-10 rounded-sm border border-primary/40 bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto size-8 text-primary" aria-hidden="true" />
          <p className="mt-3 font-display text-3xl">Appointment requested</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {service} on {date?.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} at {time}.
            The studio will confirm shortly.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild><Link to="/account">View my bookings</Link></Button>
            <Button variant="outline" onClick={() => { setDone(false); setTime(""); }}>Book another</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <Label htmlFor="bk-service">Service</Label>
              <select
                id="bk-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="mt-2 h-10 w-full rounded-sm border border-input bg-background px-3 text-sm"
              >
                {services.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="rounded-sm border border-border bg-card p-3">
              <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: today }} />
            </div>
          </div>
          <div className="space-y-6">
            <fieldset>
              <legend className="text-sm font-medium">Time slot</legend>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button
                    type="button"
                    key={s}
                    disabled={!date}
                    aria-pressed={time === s}
                    onClick={() => setTime(s)}
                    className={cn(
                      "h-9 rounded-sm border text-xs transition disabled:opacity-40",
                      time === s ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-secondary",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <Label htmlFor="bk-name">Full name</Label>
              <Input id="bk-name" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bk-contact">Phone or email</Label>
              <Input id="bk-contact" className="mt-2" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bk-notes">Notes (optional)</Label>
              <Input id="bk-notes" className="mt-2" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Booking…" : "Confirm appointment"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
