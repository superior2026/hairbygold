import { Link } from "@tanstack/react-router";
import {
  Bell,
  Heart,
  LifeBuoy,
  Menu,
  MessageCircle,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  User,
} from "lucide-react";
import { useState } from "react";
import { ProductSearch } from "@/components/product-search";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Explore", to: "/explore" as const },
  { label: "Wishlist", to: "/wishlist" as const },
  { label: "Orders", to: "/orders" as const },
  { label: "Chat", to: "/chat" as const },
  { label: "Help", to: "/help" as const },
];

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-medium leading-4 text-primary-foreground">
      {count}
    </span>
  );
}

export function SiteHeader() {
  const { cartCount, wishlist, unreadCount } = useStore();
  const { theme, toggle } = useTheme();
  const [mobileSearch, setMobileSearch] = useState(false);

  const iconCls =
    "relative grid size-11 place-items-center rounded-full text-foreground transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 lg:px-8">
        <Sheet>
          <SheetTrigger
            aria-label="Open navigation menu"
            className={cn(iconCls, "md:hidden")}
          >
            <Menu className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="sr-only">Hair by Gold Beauty Hub &amp; Spa</SheetTitle>
              <BrandLogo className="w-full" imgClassName="h-10" />
            </SheetHeader>
            <nav aria-label="Mobile" className="mt-4 flex flex-col px-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-sm py-3 text-sm transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                  activeProps={{ className: "text-primary" }}
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/settings" className="rounded-sm py-3 text-sm hover:text-primary">
                Settings
              </Link>
              <Link to="/login" className="rounded-sm py-3 text-sm hover:text-primary">
                Sign in
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          aria-label="Hair by Gold Beauty Hub & Spa — home"
          className="rounded-sm focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <BrandLogo imgClassName="h-8 sm:h-9" />
        </Link>

        <nav aria-label="Primary" className="ml-6 hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-sm text-sm text-foreground/75 transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ProductSearch className="hidden w-64 lg:block xl:w-80" />
          <button
            type="button"
            aria-label="Search products"
            aria-expanded={mobileSearch}
            onClick={() => setMobileSearch((v) => !v)}
            className={cn(iconCls, "lg:hidden")}
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className={iconCls}
          >
            {theme === "dark" ? (
              <Sun className="size-5" aria-hidden="true" />
            ) : (
              <Moon className="size-5" aria-hidden="true" />
            )}
          </button>
          <Link to="/help" aria-label="Help center" className={cn(iconCls, "hidden sm:grid")}>
            <LifeBuoy className="size-5" aria-hidden="true" />
          </Link>
          <Link to="/chat" aria-label="Concierge chat" className={cn(iconCls, "hidden sm:grid")}>
            <MessageCircle className="size-5" aria-hidden="true" />
          </Link>
          <Link
            to="/notifications"
            aria-label={`Notifications, ${unreadCount} unread`}
            className={iconCls}
          >
            <Bell className="size-5" aria-hidden="true" />
            <Badge count={unreadCount} />
          </Link>
          <Link
            to="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} items`}
            className={cn(iconCls, "hidden sm:grid")}
          >
            <Heart className="size-5" aria-hidden="true" />
            <Badge count={wishlist.length} />
          </Link>
          <Link to="/cart" aria-label={`Cart, ${cartCount} items`} className={iconCls}>
            <ShoppingBag className="size-5" aria-hidden="true" />
            <Badge count={cartCount} />
          </Link>
          <Link to="/settings" aria-label="Account settings" className={cn(iconCls, "hidden sm:grid")}>
            <User className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {mobileSearch ? (
        <div className="border-t border-border px-5 py-3 lg:hidden">
          <ProductSearch />
        </div>
      ) : null}
    </header>
  );
}
