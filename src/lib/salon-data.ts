import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

export type Service = {
  id: string;
  name: string;
  description: string;
  from?: number;
  duration: string;
  image: string;
  imageAlt: string;
};

export const services: Service[] = [
  {
    id: "wig-installation",
    name: "Wig Installation",
    description:
      "A seamless melt with a customised hairline, flat-laid edges and a style set that lasts through the week.",
    from: 45,
    duration: "90 min",
    image: g1,
    imageAlt: "Glossy straight installed unit with an invisible lace parting",
  },
  {
    id: "frontal-installation",
    name: "Frontal Installation",
    description:
      "Ear-to-ear frontal fitted, bleached and plucked to your density, then styled with a soft, natural swoop.",
    from: 60,
    duration: "2 hrs",
    image: g5,
    imageAlt: "Body-wave frontal unit styled on a studio stand",
  },
  {
    id: "closure-installation",
    name: "Closure Installation",
    description:
      "A protective closure sew-in with a flawless parting, laid with breathable tension for everyday wear.",
    from: 50,
    duration: "2 hrs",
    image: g1,
    imageAlt: "Silky closure install with a clean centre parting",
  },
  {
    id: "wig-revamp",
    name: "Wig Revamp",
    description:
      "Deep wash, detangle, knot bleaching and a fresh cut to bring a tired unit back to first-day glory.",
    from: 35,
    duration: "2–3 hrs",
    image: g5,
    imageAlt: "Revamped wig with restored waves on a salon stand",
  },
  {
    id: "hair-styling",
    name: "Hair Styling",
    description:
      "Silk press, waves, curls or a sleek finish — shaped around your face and the occasion you're dressing for.",
    from: 30,
    duration: "60 min",
    image: g6,
    imageAlt: "Voluminous curled styling with a glamorous finish",
  },
  {
    id: "bridal-hair",
    name: "Bridal Hair",
    description:
      "A trial, a timeline and a look that holds all day — veil-friendly updos and soft glam for your big morning.",
    from: 120,
    duration: "3 hrs + trial",
    image: g2,
    imageAlt: "Bridal updo with gold pins and a delicate veil",
  },
  {
    id: "birthday-hair",
    name: "Birthday Hair",
    description:
      "Statement volume, glossy curls and gold accents for photos that look as good as the night felt.",
    from: 55,
    duration: "2 hrs",
    image: g6,
    imageAlt: "Birthday glam curls under warm golden lights",
  },
  {
    id: "ponytails",
    name: "Ponytails",
    description:
      "Sleek high ponies, wrapped bases and bone-straight lengths — laid tight, finished glassy.",
    from: 25,
    duration: "60 min",
    image: g3,
    imageAlt: "Sleek high ponytail with a wrapped base and glossy finish",
  },
  {
    id: "natural-hair-styling",
    name: "Natural Hair Styling",
    description:
      "Wash day done properly: cleanse, treat, define and stretch your curls with heat-safe products.",
    from: 40,
    duration: "2 hrs",
    image: g4,
    imageAlt: "Defined voluminous natural curls with a healthy sheen",
  },
  {
    id: "home-service",
    name: "Home Service",
    description:
      "The studio comes to you — any service above delivered at home, with travel arranged around your schedule.",
    duration: "By arrangement",
    image: g2,
    imageAlt: "Stylist's finished look created during a home appointment",
  },
];

export const galleryCategories = [
  "All",
  "Installations",
  "Bridal",
  "Wig Styling",
  "Ponytails",
  "Natural Hair",
  "Special Occasions",
] as const;

export type GalleryCategory = (typeof galleryCategories)[number];

export type GalleryItem = {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, "All">;
  image: string;
  alt: string;
};

export const galleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Invisible Part Install",
    category: "Installations",
    image: g1,
    alt: "Bone-straight install with an invisible lace parting and glossy finish",
  },
  {
    id: "gal-2",
    title: "Veil-Ready Bridal Updo",
    category: "Bridal",
    image: g2,
    alt: "Bride wearing a soft twisted updo with gold pins and a beaded veil",
  },
  {
    id: "gal-3",
    title: "Glass Ponytail",
    category: "Ponytails",
    image: g3,
    alt: "Sleek high ponytail with a wrapped base and mirror-smooth lengths",
  },
  {
    id: "gal-4",
    title: "Defined Curl Wash Day",
    category: "Natural Hair",
    image: g4,
    alt: "Client with defined voluminous natural curls after a wash-day service",
  },
  {
    id: "gal-5",
    title: "Body Wave Revamp",
    category: "Wig Styling",
    image: g5,
    alt: "Revamped body-wave unit styled on a stand beside gold salon tools",
  },
  {
    id: "gal-6",
    title: "Birthday Glam Curls",
    category: "Special Occasions",
    image: g6,
    alt: "Birthday glam look with bouncy curls and gold jewellery",
  },
  {
    id: "gal-7",
    title: "Frontal Melt Finish",
    category: "Installations",
    image: g5,
    alt: "Frontal unit with a melted hairline and soft side swoop",
  },
  {
    id: "gal-8",
    title: "Soft Glam Bridal Trial",
    category: "Bridal",
    image: g2,
    alt: "Bridal trial styling with a low chignon and gold hair pins",
  },
  {
    id: "gal-9",
    title: "Stretched Curl Set",
    category: "Natural Hair",
    image: g4,
    alt: "Stretched natural curl set with volume through the crown",
  },
  {
    id: "gal-10",
    title: "Straight Silk Press",
    category: "Wig Styling",
    image: g1,
    alt: "Silk-pressed straight lengths with a high-shine finish",
  },
  {
    id: "gal-11",
    title: "Party Pony",
    category: "Ponytails",
    image: g3,
    alt: "Long sleek ponytail styled for an evening event",
  },
  {
    id: "gal-12",
    title: "Gala Night Waves",
    category: "Special Occasions",
    image: g6,
    alt: "Deep glossy waves styled for a gala evening",
  },
];
