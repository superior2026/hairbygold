import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, listMyBookings, saveMyProfile } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — Hair by Gold" },
      { name: "description", content: "Your Hair by Gold profile, booking history and studio chat." },
      { property: "og:title", content: "My Account — Hair by Gold" },
      { property: "og:description", content: "Your profile, bookings and chat with the studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const persist = useServerFn(saveMyProfile);
  const fetchBookings = useServerFn(listMyBookings);
  const profile = useQuery({ queryKey: ["my-profile"], queryFn: () => fetchProfile() });
  const bookings = useQuery({ queryKey: ["my-bookings"], queryFn: () => fetchBookings() });
  const [values, setValues] = useState({ full_name: "", phone: "", hair_notes: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile.data)
      setValues({
        full_name: profile.data.full_name,
        phone: profile.data.phone,
        hair_notes: profile.data.hair_notes,
      });
  }, [profile.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (values.full_name.trim().length < 2) {
      setMsg("Enter your name.");
      return;
    }
    setBusy(true);
    try {
      await persist({ data: values });
      setMsg("Profile saved.");
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    } catch {
      setMsg("Couldn't save just now — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/login", replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] tracking-luxe text-primary">Your account</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            Hello{profile.data?.full_name ? `, ${profile.data.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{profile.data?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/chat"
            className="inline-flex h-10 items-center rounded-sm border border-input px-4 text-sm hover:bg-secondary"
          >
            Open my chat
          </Link>
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <form onSubmit={save} className="space-y-4 rounded-sm border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Profile</h2>
          {profile.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              <div>
                <Label htmlFor="a-name">Full name</Label>
                <Input
                  id="a-name"
                  className="mt-2"
                  maxLength={80}
                  value={values.full_name}
                  onChange={(e) => setValues((v) => ({ ...v, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="a-phone">Phone</Label>
                <Input
                  id="a-phone"
                  type="tel"
                  className="mt-2"
                  maxLength={40}
                  value={values.phone}
                  onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="a-notes">Hair notes for your stylist (optional)</Label>
                <Textarea
                  id="a-notes"
                  rows={3}
                  className="mt-2"
                  maxLength={500}
                  value={values.hair_notes}
                  onChange={(e) => setValues((v) => ({ ...v, hair_notes: e.target.value }))}
                />
              </div>
              {msg ? (
                <p role="status" className="text-sm text-muted-foreground">
                  {msg}
                </p>
              ) : null}
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save profile"}
              </Button>
            </>
          )}
        </form>

        <section className="rounded-sm border border-border bg-card p-6" aria-label="Booking history">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">My bookings</h2>
            <Link to="/services" className="text-sm text-primary hover:underline">
              Book a service
            </Link>
          </div>
          {bookings.isLoading ? (
            <Skeleton className="mt-4 h-32 w-full" />
          ) : (bookings.data ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {bookings.data!.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="block font-medium">{b.service_name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {new Date(b.preferred_date).toLocaleDateString()} {b.preferred_time}
                    </span>
                  </span>
                  <span className="rounded-sm bg-secondary px-2 py-1 text-xs capitalize">{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
