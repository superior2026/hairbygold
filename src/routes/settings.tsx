import { createFileRoute } from "@tanstack/react-router";
import { Check, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandAssetsPanel } from "@/components/brand-assets-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { savedAddresses } from "@/lib/mock-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — Hair by Gold" },
      {
        name: "description",
        content: "Manage your Hair by Gold profile, delivery addresses, password and studio preferences.",
      },
      { property: "og:title", content: "Account Settings — Hair by Gold" },
      { property: "og:description", content: "Profile, addresses, password and preferences." },
    ],
  }),
  component: Settings,
});

type Errors = Record<string, string>;

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p role="status" className="inline-flex items-center gap-1.5 text-xs text-success">
      <Check className="size-3.5" aria-hidden="true" />
      Saved!
    </p>
  );
}

function Field({
  id,
  label,
  value,
  error,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string | undefined;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        className="mt-2"
        maxLength={255}
        value={value}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ProfilePanel() {
  const [form, setForm] = useState({
    name: "Olamide Adebayo",
    email: "olamide@example.com",
    phone: "+234 802 555 0134",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (form["name"].trim().length < 2) next["name"] = "Enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form["email"].trim())) next["email"] = "Enter a valid email";
    if (form["phone"].trim().length < 7) next["phone"] = "Enter a reachable phone number";
    setErrors(next);
    setSaved(false);
    if (Object.keys(next).length) return;
    setSaved(true);
    toast.success("Profile saved (mock)");
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-sm border border-border bg-card p-7">
      <h2 className="font-display text-2xl">Profile</h2>
      <Field
        id="name"
        label="Full name"
        value={form["name"]}
        error={errors["name"]}
        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
      />
      <Field
        id="email"
        label="Email"
        type="email"
        value={form["email"]}
        error={errors["email"]}
        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
      />
      <Field
        id="phone"
        label="Phone"
        value={form["phone"]}
        error={errors["phone"]}
        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
      />
      <div className="flex items-center gap-4">
        <Button type="submit">Save profile</Button>
        <SavedBadge show={saved} />
      </div>
    </form>
  );
}

function AddressPanel() {
  const [addresses, setAddresses] = useState(savedAddresses);
  const [form, setForm] = useState({ label: "", line1: "", city: "", country: "", phone: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (form["label"].trim().length < 2) next["label"] = "Name this address (e.g. Home)";
    if (form["line1"].trim().length < 4) next["line1"] = "Enter the street address";
    if (form["city"].trim().length < 2) next["city"] = "Enter the city";
    if (form["country"].trim().length < 2) next["country"] = "Enter the country";
    if (form["phone"].trim().length < 7) next["phone"] = "Enter a contact number";
    setErrors(next);
    setSaved(false);
    if (Object.keys(next).length) return;
    setAddresses((prev) => [
      ...prev,
      { id: `a${prev.length + 1}`, ...form, primary: false },
    ]);
    setForm({ label: "", line1: "", city: "", country: "", phone: "" });
    setSaved(true);
    toast.success("Address saved (mock)");
  };

  const makePrimary = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, primary: a.id === id })));
    toast.success("Default address updated (mock)");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-sm border border-border bg-card p-7">
        <h2 className="font-display text-2xl">Delivery addresses</h2>
        <ul className="mt-5 space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="flex items-start gap-4 rounded-sm border border-border p-5">
              <MapPin className="mt-0.5 size-4 text-primary" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm">
                  {a.label}
                  {a.primary ? (
                    <span className="ml-2 rounded-sm bg-secondary px-2 py-0.5 text-[0.6rem] tracking-luxe text-primary">
                      Default
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.line1} · {a.city} · {a.country} · {a.phone}
                </p>
              </div>
              {a.primary ? null : (
                <Button variant="outline" size="sm" onClick={() => makePrimary(a.id)}>
                  Make default
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={submit} className="space-y-5 rounded-sm border border-border bg-card p-7">
        <h3 className="font-display text-xl">Add an address</h3>
        {(
          [
            ["label", "Label"],
            ["line1", "Street address"],
            ["city", "City"],
            ["country", "Country"],
            ["phone", "Phone"],
          ] as const
        ).map(([name, label]) => (
          <Field
            key={name}
            id={name}
            label={label}
            value={form[name]}
            error={errors[name]}
            onChange={(v) => setForm((f) => ({ ...f, [name]: v }))}
          />
        ))}
        <div className="flex items-center gap-4">
          <Button type="submit">Save address</Button>
          <SavedBadge show={saved} />
        </div>
      </form>
    </div>
  );
}

function SecurityPanel() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (form["current"].length < 8) next["current"] = "Enter your current password";
    if (form["next"].length < 8) next["next"] = "Use at least 8 characters";
    if (!/[0-9]/.test(form["next"])) next["next"] = "Include at least one number";
    if (form["confirm"] !== form["next"]) next["confirm"] = "Passwords do not match";
    setErrors(next);
    setSaved(false);
    if (Object.keys(next).length) return;
    setForm({ current: "", next: "", confirm: "" });
    setSaved(true);
    toast.success("Password changed (mock)");
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-sm border border-border bg-card p-7">
      <h2 className="font-display text-2xl">Change password</h2>
      <Field
        id="current"
        label="Current password"
        type="password"
        value={form["current"]}
        error={errors["current"]}
        onChange={(v) => setForm((f) => ({ ...f, current: v }))}
      />
      <Field
        id="next"
        label="New password"
        type="password"
        value={form["next"]}
        error={errors["next"]}
        onChange={(v) => setForm((f) => ({ ...f, next: v }))}
      />
      <Field
        id="confirm"
        label="Confirm new password"
        type="password"
        value={form["confirm"]}
        error={errors["confirm"]}
        onChange={(v) => setForm((f) => ({ ...f, confirm: v }))}
      />
      <div className="flex items-center gap-4">
        <Button type="submit">Update password</Button>
        <SavedBadge show={saved} />
      </div>
      <p className="inline-flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Demo only — no credentials are stored.
      </p>
    </form>
  );
}

function PreferencesPanel() {
  const [prefs, setPrefs] = useState({
    orders: true,
    drops: true,
    concierge: false,
  });

  const rows = [
    ["orders", "Order updates", "Shipping, delivery and tracking alerts."],
    ["drops", "New drops", "Restocks and limited studio collections."],
    ["concierge", "Concierge follow-ups", "Stylist check-ins after a purchase."],
  ] as const;

  return (
    <section className="space-y-5 rounded-sm border border-border bg-card p-7">
      <h2 className="font-display text-2xl">Preferences</h2>
      <ul className="divide-y divide-border">
        {rows.map(([key, title, desc]) => (
          <li key={key} className="flex items-center justify-between gap-6 py-4">
            <div>
              <p className="text-sm">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </div>
            <Switch
              checked={prefs[key]}
              aria-label={title}
              onCheckedChange={(v) => {
                setPrefs((p) => ({ ...p, [key]: v }));
                toast.success(`${title} ${v ? "on" : "off"} (mock)`);
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Settings() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Account</p>
        <h1 className="mt-4 font-display text-5xl">Settings</h1>
      </header>

      <Tabs defaultValue="profile" className="mt-10">
        <TabsList>
          <TabsTrigger value="profile">
            <UserRound className="size-3.5" aria-hidden="true" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <ProfilePanel />
        </TabsContent>
        <TabsContent value="addresses" className="mt-6">
          <AddressPanel />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <SecurityPanel />
        </TabsContent>
        <TabsContent value="preferences" className="mt-6">
          <PreferencesPanel />
        </TabsContent>
        <TabsContent value="brand" className="mt-6">
          <BrandAssetsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
