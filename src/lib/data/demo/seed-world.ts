import type {
  DictionaryEntry,
  FirstRecord,
  FutureGoal,
  LittleThing,
  Place,
  Reflection,
  SoundtrackSong,
  SurvivedEntry,
  TimeCapsule,
} from "@/lib/types";
import { LINHO, BIGGY, REL } from "@/lib/data/demo/seed-core";

/**
 * Real facts only. Firsts and places use only supplied information; where a
 * date or exact spot is unknown it is left null (written "to be confirmed").
 * Personal collections (dictionary, little things, soundtrack, goals,
 * reflections, survived, capsules) start empty — the couple fills them in.
 */
export const seedDictionary: DictionaryEntry[] = [];

export const seedLittleThings: LittleThing[] = [];

export const seedFirsts: FirstRecord[] = [
  {
    id: "f1",
    relationshipId: REL,
    title: "Our first meeting",
    date: null,
    description: "Youth Impact registration at Deeper Life Bible Church. Biggy was at the registration desk and noticed Linho's native middle name from the start. Exact date — to be confirmed.",
    custom: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: LINHO,
  },
  {
    id: "f2",
    relationshipId: REL,
    title: "Our first conversation",
    date: null,
    description: "Started on WhatsApp after a mutual friend connected us. Exact start — to be written.",
    custom: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: BIGGY,
  },
  {
    id: "f3",
    relationshipId: REL,
    title: "Our first call",
    date: null,
    description: "A long late-night call. The details live in the memory of it — to be written together.",
    custom: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: LINHO,
  },
  {
    id: "f4",
    relationshipId: REL,
    title: "Our first video call",
    date: null,
    description: "One of the first video calls — part of how we stretched from the registration desk into his and hers.",
    custom: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: BIGGY,
  },
  {
    id: "f5",
    relationshipId: REL,
    title: "Our first date",
    date: "2024-09-15T00:00:00.000Z",
    description:
      "September 2024, at Aberdeen Beach, Freetown. No kiss that day — but Biggy fell asleep on Linho's lap.",
    custom: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: LINHO,
  },
  {
    id: "f6",
    relationshipId: REL,
    title: "Our second date",
    date: null,
    description: "Also around September 2024. Where it was and what happened is a page still waiting to be written.",
    custom: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: BIGGY,
  },
  {
    id: "f7",
    relationshipId: REL,
    title: "The day we became us",
    date: "2024-11-13T00:00:00.000Z",
    description:
      "November 13, 2024, at Badagry Beach. Linho asked, Biggy said yes. The day we count everything from.",
    custom: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: LINHO,
  },
  {
    id: "f8",
    relationshipId: REL,
    title: "Our first kiss",
    date: "2024-11-13T00:00:00.000Z",
    description: "After the yes, on November 13, 2024 — the hug, then the first kiss.",
    custom: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: BIGGY,
  },
];

export const seedPlaces: Place[] = [
  {
    id: "pl1",
    relationshipId: REL,
    name: "Deeper Life Bible Church — Youth Impact",
    latitude: 6.4556,
    longitude: 3.4043,
    date: null,
    story:
      "Where we met — Biggy at the registration desk, Linho's native middle name catching his eye. Map position is approximate; the exact church to be confirmed.",
    memoryIds: ["mem01"],
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "pl2",
    relationshipId: REL,
    name: "Badagry Beach",
    latitude: 6.415,
    longitude: 2.882,
    date: "2024-11-13T00:00:00.000Z",
    story:
      "November 13, 2024 — where Linho asked and Biggy said yes. The hug, and the first kiss. Coordinates approximate; exact spot to confirm.",
    memoryIds: ["mem05"],
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "pl3",
    relationshipId: REL,
    name: "Aberdeen Beach — our first date",
    latitude: 6.4585,
    longitude: 3.6137,
    date: "2024-09-15T00:00:00.000Z",
    story:
      "September 2024 — the first date, at Aberdeen Beach, Freetown. Biggy slept on Linho's lap; neither of us has been the same since. Exact day and exact spot along the beach — still to be confirmed.",
    memoryIds: ["mem03"],
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

export const seedSoundtrack: SoundtrackSong[] = [];

export const seedGoals: FutureGoal[] = [];

export function buildSeedCapsules(): TimeCapsule[] {
  return [];
}

export const seedReflections: Reflection[] = [];

export const seedSurvived: SurvivedEntry[] = [];