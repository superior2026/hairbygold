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
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BrandLogo } from "@/components/brand-logo";
import { ProductSearch } from "@/components/product-search";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Explore", to: "/explore" as const },
  { label: "Services", to: "/services" as const },
  { label: "Gallery", to: "/gallery" as const },
  { label: "Style advisor", to: "/style-advisor" as const },
  { label: "Orders", to: "/orders" as const },
  { label: "Chat", to: "/chat" as const },
];

const mobileOnlyLinks = [
  { label: "Wishlist", to: "/wishlist" as const },
  { label: "Help", to: "/help" as const },
  { label: "My account", to: "/account" as const },
  { label: "Owner dashboard", to: "/dashboard" as const },
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
  const reduceMotion = useReducedMotion();
  const [mobileSearch, setMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconCls =
    "relative grid size-11 place-items-center rounded-full text-foreground transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur transition-[background-color,box-shadow] duration-300",
        scrolled && "bg-background/95 shadow-soft",
      )}
    >
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
              <BrandLogo className="w-full justify-start py-1" imgClassName="h-9 w-auto" />
            </SheetHeader>
            <motion.nav
              aria-label="Mobile"
              className="mt-4 flex flex-col px-4"
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05, delayChildren: reduceMotion ? 0 : 0.12 } },
              }}
            >
              {[...navLinks, ...mobileOnlyLinks].map((l) => (
                <motion.div
                  key={l.to}
                  variants={{
                    hidden: { opacity: 0, x: -16 },
                    show: { opacity: 1, x: 0, transition: { duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  <Link
                    to={l.to}
                    className="block rounded-sm py-3 text-sm transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                    activeProps={{ className: "text-primary" }}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }}>
                <Link to="/settings" className="block rounded-sm py-3 text-sm hover:text-primary">
                  Settings
                </Link>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }}>
                <Link to="/login" className="block rounded-sm py-3 text-sm hover:text-primary">
                  Sign in
                </Link>
              </motion.div>
            </motion.nav>
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          aria-label="Hair by Gold Beauty Hub & Spa — home"
          className="flex shrink-0 items-center rounded-sm py-1 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <BrandLogo imgClassName="h-8 sm:h-9 md:h-10" />
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

      <AnimatePresence initial={false}>
        {mobileSearch ? (
          <motion.div
            key="mobile-search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <div className="px-5 py-3">
              <ProductSearch />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
