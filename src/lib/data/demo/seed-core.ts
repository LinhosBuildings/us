import type { Chapter, Relationship, User } from "@/lib/types";
import { svgAvatar, svgPhoto } from "@/lib/data/demo-art";

export const REL = "rel_demo";
export const ALEX = "usr_alex";
export const MAYA = "usr_maya";
export const START = "2024-08-18T10:00:00.000Z";

export const seedUsers: User[] = [
  {
    id: ALEX,
    name: "Alex",
    email: "alex@demo.us",
    passwordHash: "",
    avatarUrl: svgAvatar({ seed: "alex", name: "Alex" }),
    relationshipId: REL,
  },
  {
    id: MAYA,
    name: "Maya",
    email: "maya@demo.us",
    passwordHash: "",
    avatarUrl: svgAvatar({ seed: "maya", name: "Maya" }),
    relationshipId: REL,
  },
];

export const seedRelationship: Relationship = {
  id: REL,
  code: "TOGETHER-24",
  secretCode: "TOGETHER-24",
  name: "Alex × Maya",
  startDate: START,
  title: "Universe",
  description:
    "A private universe built from the day we met. Every star is a memory we chose to keep — the small ones and the hard ones. We keep adding to it, and one day we'll sit in the Forever Room and read it all.",
  coverImageUrl: svgPhoto({
    seed: "cover",
    label: "A&M",
    title: "two years, still us",
    date: "since august 18, 2024",
    mood: "forever",
  }),
  members: [
    { id: ALEX, name: "Alex", email: "alex@demo.us", avatarUrl: null, isOwner: true },
    { id: MAYA, name: "Maya", email: "maya@demo.us", avatarUrl: null, isOwner: false },
  ],
  createdAt: "2025-01-01T00:00:00.000Z",
};

export const seedChapters: Chapter[] = [
  {
    id: "ch1",
    relationshipId: REL,
    order: 1,
    code: "CHAPTER 01",
    title: "Before We Became Us",
    epigraph: "There was a time when we were strangers.",
    intro:
      "Neither of us knew the other existed. The universe was still deciding where to put us.",
  },
  {
    id: "ch2",
    relationshipId: REL,
    order: 2,
    code: "CHAPTER 02",
    title: "The Beginning",
    epigraph: "One conversation. That was all it took.",
    intro: "We didn't plan any of this. It simply started.",
  },
  {
    id: "ch3",
    relationshipId: REL,
    order: 3,
    code: "CHAPTER 03",
    title: "We Became Us",
    epigraph: "And everything changed.",
    intro: "August 18, 2024. The day we stopped being two people and started being us.",
  },
  {
    id: "ch4",
    relationshipId: REL,
    order: 4,
    code: "CHAPTER 04",
    title: "The Little Things",
    epigraph: "Love hides in the unremarkable.",
    intro: "The late voice notes. The inside jokes. The ordinary days we refused to forget.",
  },
  {
    id: "ch5",
    relationshipId: REL,
    order: 5,
    code: "CHAPTER 05",
    title: "The Hard Days",
    epigraph: "We didn't have a perfect story. We had a real one.",
    intro: "There were months we almost lost each other. We don't erase them — we survived them.",
  },
  {
    id: "ch6",
    relationshipId: REL,
    order: 6,
    code: "CHAPTER 06",
    title: "Where We Are Now",
    epigraph: "Two years. Still us.",
    intro: "We are here. Together, still writing.",
  },
];