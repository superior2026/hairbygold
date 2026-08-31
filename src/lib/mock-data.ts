import hero from "@/assets/hero.jpg";
import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

export const heroImage = hero;

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  length: string;
  texture: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  description: string;
  inStock?: boolean;
};

export const categories = [
  "All",
  "Lace Front Wigs",
  "Closure Wigs",
  "Bundles",
  "Hair Care",
  "Accessories",
] as const;

export const textures = ["Straight", "Body Wave", "Deep Wave", "Curly", "Kinky"];
export const lengths = ['12"', '16"', '20"', '24"', '28"'];

const images = [p1, p2, p3, p4];

const seed: Array<Omit<Product, "id" | "image">> = [
  {
    name: "Aurelia Straight Lace Front",
    price: 420,
    category: "Lace Front Wigs",
    length: '24"',
    texture: "Straight",
    rating: 4.9,
    reviews: 214,
    badge: "Bestseller",
    description:
      "A glass-smooth virgin straight unit on a transparent HD lace front, pre-plucked with a natural density hairline.",
  },
  {
    name: "Honeycomb Curly Glueless",
    price: 385,
    category: "Lace Front Wigs",
    length: '20"',
    texture: "Curly",
    rating: 4.8,
    reviews: 168,
    badge: "New",
    description:
      "Sun-kissed honey blonde curls with a glueless adjustable band — wear it out of the box in under five minutes.",
  },
  {
    name: "Golden Hour Deep Wave Bundles",
    price: 265,
    category: "Bundles",
    length: '22"',
    texture: "Deep Wave",
    rating: 4.7,
    reviews: 132,
    description:
      "Three bundles of double-drawn deep wave hair, cuticle aligned and tied in our signature gold ribbon.",
  },
  {
    name: "Ritual Hair Elixir & Silk Set",
    price: 96,
    category: "Hair Care",
    length: "—",
    texture: "—",
    rating: 4.9,
    reviews: 341,
    badge: "Editor's pick",
    description:
      "A featherweight shine oil paired with a mulberry silk bonnet to protect your investment overnight.",
  },
  {
    name: "Noir Body Wave Closure",
    price: 340,
    category: "Closure Wigs",
    length: '18"',
    texture: "Body Wave",
    rating: 4.6,
    reviews: 88,
    description: "A 5x5 closure unit with soft, brushed-out body wave movement and a bleached-knot parting.",
  },
  {
    name: "Sable Kinky Straight Unit",
    price: 455,
    category: "Lace Front Wigs",
    length: '28"',
    texture: "Kinky",
    rating: 4.8,
    reviews: 76,
    description: "Blown-out kinky straight texture that blends seamlessly with relaxed and heat-styled natural hair.",
  },
  {
    name: "Champagne Silk Press Bundles",
    price: 210,
    category: "Bundles",
    length: '16"',
    texture: "Straight",
    rating: 4.5,
    reviews: 59,
    description: "Lightweight single-donor bundles finished with a salon silk press for an immediate glossy drop.",
  },
  {
    name: "Gilded Wig Grip Band",
    price: 34,
    category: "Accessories",
    length: "—",
    texture: "—",
    rating: 4.7,
    reviews: 402,
    description: "A velvet-lined grip band in warm champagne that holds any unit securely without tension.",
  },
  {
    name: "Amber Curl Defining Cream",
    price: 48,
    category: "Hair Care",
    length: "—",
    texture: "—",
    rating: 4.6,
    reviews: 187,
    description: "Shea and argan curl cream that revives definition on wet or dry curly units without crunch.",
  },
  {
    name: "Solstice Straight Closure",
    price: 315,
    category: "Closure Wigs",
    length: '12"',
    texture: "Straight",
    rating: 4.4,
    reviews: 41,
    description: "A precision-cut bob on a 4x4 closure — sharp, weightless, and endlessly wearable.",
  },
  {
    name: "Velvet Deep Wave Lace Front",
    price: 470,
    category: "Lace Front Wigs",
    length: '26"',
    texture: "Deep Wave",
    rating: 5,
    reviews: 63,
    badge: "Limited",
    description: "Our fullest deep wave unit, 250% density on HD lace for maximum drama and movement.",
  },
  {
    name: "Satin Edge Lay Kit",
    price: 29,
    category: "Accessories",
    length: "—",
    texture: "—",
    rating: 4.5,
    reviews: 275,
    description: "Boar-bristle brush, satin wrap, and flake-free hold gel for a soft, polished hairline.",
  },
];

export const products: Product[] = seed.map((p, i) => ({
  ...p,
  id: `hbg-${String(i + 1).padStart(3, "0")}`,
  image: images[i % images.length] as string,
  inStock: i % 7 !== 3,
}));

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export type CartLine = { product: Product; qty: number; size: string };

export const cartLines: CartLine[] = [
  { product: products[0] as Product, qty: 1, size: '24"' },
  { product: products[3] as Product, qty: 2, size: "One size" },
  { product: products[7] as Product, qty: 1, size: "One size" },
];

export type Conversation = {
  id: string;
  name: string;
  role: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Gold Concierge",
    role: "Stylist support",
    initials: "GC",
    preview: "Your Aurelia unit ships tomorrow — want a install guide?",
    time: "2m",
    unread: 2,
    online: true,
  },
  {
    id: "c2",
    name: "Amara Bello",
    role: "Master stylist",
    initials: "AB",
    preview: "I'd go with the 22 inch for that shape, trust me.",
    time: "1h",
    unread: 0,
    online: true,
  },
  {
    id: "c3",
    name: "Orders & Returns",
    role: "Automated",
    initials: "OR",
    preview: "Return label for order #GLD-2291 attached.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "c4",
    name: "Tolu Adeyemi",
    role: "Colour specialist",
    initials: "TA",
    preview: "Honey blonde will lift beautifully on that texture.",
    time: "Mon",
    unread: 1,
    online: false,
  },
  {
    id: "c5",
    name: "Hair by Gold Studio",
    role: "Bookings",
    initials: "HG",
    preview: "Saturday 11:00 install slot is now open.",
    time: "Sun",
    unread: 0,
    online: false,
  },
];

export type Message = { id: string; from: "me" | "them"; text: string; time: string };

export const messagesByConversation: Record<string, Message[]> = {
  c1: [
    { id: "m1", from: "them", text: "Hi Olamide — welcome to Hair by Gold. How can we help today?", time: "09:12" },
    { id: "m2", from: "me", text: "Hey! Has my Aurelia lace front shipped yet?", time: "09:14" },
    {
      id: "m3",
      from: "them",
      text: "It's boxed and leaves our studio tomorrow morning. You'll get tracking by 10am.",
      time: "09:15",
    },
    { id: "m4", from: "me", text: "Perfect. Any tips for the first install?", time: "09:16" },
    {
      id: "m5",
      from: "them",
      text: "Yes — start with a clean, oil-free hairline and use the glueless band before any adhesive. I can send our 3-minute video guide.",
      time: "09:17",
    },
    { id: "m6", from: "them", text: "Want me to include a free grip band with the order?", time: "09:18" },
  ],
  c2: [
    { id: "m1", from: "them", text: "Sent over two options for your birthday look.", time: "08:40" },
    { id: "m2", from: "me", text: "The deep wave one is stunning. Too long for me?", time: "08:44" },
    { id: "m3", from: "them", text: "I'd go with the 22 inch for that shape, trust me.", time: "08:45" },
  ],
  c3: [
    { id: "m1", from: "them", text: "Return label for order #GLD-2291 attached.", time: "16:02" },
    { id: "m2", from: "me", text: "Thanks — dropping it off today.", time: "16:30" },
  ],
  c4: [
    { id: "m1", from: "them", text: "Honey blonde will lift beautifully on that texture.", time: "13:11" },
  ],
  c5: [
    { id: "m1", from: "them", text: "Saturday 11:00 install slot is now open.", time: "11:00" },
  ],
};

export type Order = {
  id: string;
  date: string;
  items: number;
  total: number;
  status: "Delivered" | "In transit" | "Processing" | "Refunded";
  method: string;
};

export const orders: Order[] = [
  { id: "GLD-2291", date: "12 Aug 2026", items: 2, total: 516, status: "Delivered", method: "Visa •••• 4429" },
  { id: "GLD-2274", date: "28 Jul 2026", items: 1, total: 385, status: "Delivered", method: "Apple Pay" },
  { id: "GLD-2260", date: "09 Jul 2026", items: 3, total: 742, status: "Refunded", method: "Visa •••• 4429" },
  { id: "GLD-2312", date: "30 Aug 2026", items: 1, total: 420, status: "In transit", method: "Mastercard •••• 8801" },
  { id: "GLD-2318", date: "31 Aug 2026", items: 4, total: 268, status: "Processing", method: "Paystack" },
];

export const paymentMethods = [
  { id: "pm1", brand: "Visa", last4: "4429", expiry: "07/29", primary: true },
  { id: "pm2", brand: "Mastercard", last4: "8801", expiry: "11/27", primary: false },
];

export const testimonials = [
  {
    name: "Zainab O.",
    text: "The lace melted on the first try. I've never had a unit look this much like my own hairline.",
  },
  { name: "Chi A.", text: "Two years in and my bundles still hold a curl. Worth every naira." },
  { name: "Renée M.", text: "The concierge chat picked my length for me and they were completely right." },
];

export type Notification = {
  id: string;
  kind: "order" | "chat" | "promo";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n1",
    kind: "order",
    title: "Order GLD-2312 is on the way",
    body: "Your Aurelia Straight Lace Front left our studio and arrives Tuesday.",
    time: "12 min ago",
    read: false,
  },
  {
    id: "n2",
    kind: "chat",
    title: "Gold Concierge mentioned you",
    body: "\u201cOlamide — want me to add a free grip band to this order?\u201d",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    kind: "promo",
    title: "Private sale: 20% off closure wigs",
    body: "Members-only until Sunday. Use code GOLD20 at checkout.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "n4",
    kind: "order",
    title: "Order GLD-2291 delivered",
    body: "Signed for by O. Adebayo. Tap to leave a review.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "n5",
    kind: "promo",
    title: "New drop: Velvet Deep Wave",
    body: "250% density on HD lace — 40 units only.",
    time: "5 days ago",
    read: true,
  },
];

export const trackingSteps = ["Order placed", "Processing", "Shipped", "Delivered"] as const;

export function trackingIndexFor(status: Order["status"]) {
  switch (status) {
    case "Processing":
      return 1;
    case "In transit":
      return 2;
    case "Delivered":
      return 3;
    default:
      return 0;
  }
}

export const promoCodes: Record<string, number> = {
  GOLD20: 0.2,
  WELCOME10: 0.1,
};

export const savedAddresses = [
  {
    id: "a1",
    label: "Home",
    line1: "18 Aderibigbe Close",
    city: "Lekki Phase 1, Lagos",
    country: "Nigeria",
    phone: "+234 802 555 0134",
    primary: true,
  },
  {
    id: "a2",
    label: "Studio",
    line1: "4 Glover Road, Ikoyi",
    city: "Lagos",
    country: "Nigeria",
    phone: "+234 809 441 2277",
    primary: false,
  },
];

export type Review = {
  id: string;
  productId: string;
  author: string;
  initials: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  daysAgo: number;
  verified: boolean;
};

const reviewSeed = [
  {
    author: "Zainab Okoye",
    rating: 5,
    title: "The lace melted first try",
    body: "I've bought a lot of units and this is the first one that genuinely looked like my own hairline out of the box.",
    date: "24 Aug 2026",
    daysAgo: 7,
  },
  {
    author: "Chiamaka A.",
    rating: 4,
    title: "Beautiful, slightly heavier than expected",
    body: "Gorgeous density and zero shedding after three washes. Took me a day to get used to the weight.",
    date: "11 Aug 2026",
    daysAgo: 20,
  },
  {
    author: "Renée Martin",
    rating: 5,
    title: "Worth the investment",
    body: "Concierge helped me pick the length over chat and they were completely right. Holds a curl beautifully.",
    date: "02 Aug 2026",
    daysAgo: 29,
  },
  {
    author: "Ify B.",
    rating: 3,
    title: "Lovely hair, slow delivery",
    body: "The quality is undeniable but shipping took longer than the estimate. Still would order again.",
    date: "19 Jul 2026",
    daysAgo: 43,
  },
  {
    author: "Simi Adeleke",
    rating: 5,
    title: "My go-to unit now",
    body: "Second one I've ordered. Soft, no tangling, and the knots are bleached perfectly.",
    date: "05 Jul 2026",
    daysAgo: 57,
  },
];

export function reviewsFor(productId: string): Review[] {
  const offset = productId.charCodeAt(productId.length - 1) % reviewSeed.length;
  return reviewSeed.map((r, i) => {
    const s = reviewSeed[(i + offset) % reviewSeed.length] as (typeof reviewSeed)[number];
    return {
      ...s,
      id: `${productId}-r${i + 1}`,
      productId,
      initials: s.author
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      verified: i % 4 !== 2,
    };
  });
}
