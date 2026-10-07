import { Link } from "@tanstack/react-router";
import { Instagram, Music2, Youtube } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const columns = [
  {
    title: "Studio",
    links: [
      { label: "Explore all", to: "/explore" as const },
      { label: "Salon services", to: "/services" as const },
      { label: "Featured hairstyles", to: "/gallery" as const },
      { label: "AI style advisor", to: "/style-advisor" as const },
      { label: "Order history", to: "/orders" as const },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Concierge chat", to: "/chat" as const },
      { label: "Notifications", to: "/notifications" as const },
      { label: "Settings", to: "/settings" as const },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", to: "/login" as const },
      { label: "Create account", to: "/signup" as const },
      { label: "Reset password", to: "/forgot-password" as const },
      { label: "Owner dashboard", to: "/dashboard" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-sidebar">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="max-w-sm">
          <BrandLogo imgClassName="h-10 sm:h-12" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Hand-selected virgin hair, HD lace units and after-care rituals — finished in our Lagos
            studio and shipped worldwide.
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Youtube, label: "YouTube" },
              { Icon: Music2, label: "TikTok" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={`Hair by Gold on ${label}`}
                className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Icon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-[0.62rem] tracking-luxe text-muted-foreground">{col.title}</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="rounded-sm text-foreground/80 transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground lg:px-8">
        © {new Date().getFullYear()} Hair by Gold. Demo scaffold — mock data, no live checkout.
      </div>
    </footer>
  );
}
