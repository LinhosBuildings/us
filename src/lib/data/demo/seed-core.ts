import type { Chapter, Relationship, User } from "@/lib/types";
import { svgAvatar, svgPhoto } from "@/lib/data/demo-art";

export const REL = "rel_bl";
export const LINHO = "usr_linho";
export const BIGGY = "usr_biggy";
export const START = "2024-11-13T00:00:00.000Z";

/**
 * Production identity. Only real, supplied information is used.
 * Biggy's email is intentionally empty — the couple will add it (never invented).
 */
export const seedUsers: User[] = [
  {
    id: LINHO,
    name: "Linho",
    email: "paulannehk@gmail.com",
    passwordHash: "",
    avatarUrl: svgAvatar({ seed: "linho", name: "Linho" }),
    relationshipId: REL,
  },
  {
    id: BIGGY,
    name: "Biggy",
    email: "",
    passwordHash: "",
    avatarUrl: svgAvatar({ seed: "biggy", name: "Biggy" }),
    relationshipId: REL,
  },
];

export const seedRelationship: Relationship = {
  id: REL,
  code: "NOV13-24",
  secretCode: "NOV13-24",
  name: "BIGGY~LINHO",
  startDate: START,
  title: "Universe",
  description:
    "A private universe for two people. It begins at a registration desk and runs all the way to the beach where we became us — and every chapter after that is still being written.",
  coverImageUrl: svgPhoto({
    seed: "cover",
    label: "B&L",
    title: "biggy ~ linho",
    date: "since november 13, 2024",
    mood: "forever",
  }),
  members: [
    { id: LINHO, name: "Linho", email: "paulannehk@gmail.com", avatarUrl: null, isOwner: true },
    { id: BIGGY, name: "Biggy", email: "", avatarUrl: null, isOwner: false },
  ],
  createdAt: "2025-01-01T00:00:00.000Z",
};

export const seedChapters: Chapter[] = [
  {
    id: "ch1",
    relationshipId: REL,
    order: 1,
    code: "CHAPTER 01",
    title: "Before We Knew Each Other",
    epigraph: "Two lives, not yet one story.",
    intro:
      "There was a time before the registration desk — two people who hadn't met, whose paths were quietly moving toward the same church hall. We don't have to know every detail of that time. We just know they led here.",
  },
  {
    id: "ch2",
    relationshipId: REL,
    order: 2,
    code: "CHAPTER 02",
    title: "The Registration Desk",
    epigraph: "It started with a name.",
    intro:
      "We met at Youth Impact registration. Biggy was at the desk, and noticed Linho's native middle name. A mutual friend connected us, and from there the conversation started on WhatsApp — the first of very many late-night calls and video calls.",
  },
  {
    id: "ch3",
    relationshipId: REL,
    order: 3,
    code: "CHAPTER 03",
    title: "The First Conversations",
    epigraph: "Night after night, on the phone.",
    intro:
      "Between the registration desk and the first date there were long WhatsApp conversations, late-night calls and video calls. This chapter holds the small beginnings — the ones we haven't fully written down yet.",
  },
  {
    id: "ch4",
    relationshipId: REL,
    order: 4,
    code: "CHAPTER 04",
    title: "The First Dates",
    epigraph: "The beach, and the quiet that followed.",
    intro:
      "Our first date was in September 2024, at Aberdeen Beach, Lagos. No kiss — but Biggy fell asleep on Linho's lap, and somehow that was better. The exact day, and the details of the second date, are still being confirmed. This chapter is partly finished, and that's okay.",
  },
  {
    id: "ch5",
    relationshipId: REL,
    order: 5,
    code: "CHAPTER 05",
    title: "November 13, 2024",
    epigraph: "The day we became us.",
    intro:
      "At the beach — Badagry Beach, to the best of our records — Linho asked, and Biggy said yes. A verbal proposal, a hug, and a first kiss. November 13th became the day we count everything from.",
  },
  {
    id: "ch6",
    relationshipId: REL,
    order: 6,
    code: "CHAPTER 06",
    title: "The Chapter We're Writing",
    epigraph: "Still us. Still writing.",
    intro:
      "This is the chapter we're in right now. Everything from here is being written by us, together — one memory, one letter, one ordinary day at a time.",
  },
];