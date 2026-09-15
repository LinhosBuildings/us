export type Mood =
  | "joy"
  | "love"
  | "laughter"
  | "tenderness"
  | "peace"
  | "yearning"
  | "ache"
  | "pride"
  | "grateful"
  | "wonder"
  | "homesick"
  | "ordinary";

export type MemoryKind =
  | "photo"
  | "video"
  | "voice"
  | "text"
  | "conversation"
  | "place"
  | "milestone"
  | "little-thing";

export type MemoryVisibility = "both" | "me-only";

export type MediaType = "image" | "video" | "audio";

export interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  mime: string;
  sizeBytes: number;
  createdAt: string;
}

export interface Song {
  /** optional in demo seed data; assigned by the store in memory/prod */
  id?: string;
  title: string;
  artist: string;
  externalUrl?: string | null;
}

export interface Memory {
  id: string;
  relationshipId: string;
  title: string;
  kind: MemoryKind;
  date: string;
  description: string;
  locationName?: string | null;
  mood?: Mood | null;
  people: string[];
  tags: string[];
  media: MediaAsset[];
  song?: Song | null;
  visibility: MemoryVisibility;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  /** which user created it (for "who" display) */
  createdByName: string;
  /** star placement on the constellation (0..1 relative coords) */
  constellationX?: number | null;
  constellationY?: number | null;
  chapterId?: string | null;
  /** private reflection — "what I never told you" */
  neverTold?: string | null;
  milestone?: MilestoneInfo | null;
}

export interface MilestoneInfo {
  label: string;
  category?: string | null;
}

export interface Perspective {
  id: string;
  memoryId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  relationshipId: string;
  order: number;
  code: string;
  title: string;
  epigraph?: string | null;
  intro?: string | null;
}

export interface Letter {
  id: string;
  relationshipId: string;
  authorId: string;
  authorName: string;
  title: string;
  category: LetterCategory;
  body: string;
  createdAt: string;
  lockAt?: string | null;
  media: MediaAsset[];
}

export type LetterCategory =
  | "to-you"
  | "what-i-love"
  | "never-forget"
  | "thank-you"
  | "im-sorry"
  | "future-wife"
  | "future-husband"
  | "future-family"
  | "when-were-old";

export type LockBehavior = "immediate" | "date" | "interaction" | "permanent";

export interface OpenWhenEntry {
  id: string;
  relationshipId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  media: MediaAsset[];
  lockBehavior: LockBehavior;
  unlockAt?: string | null;
  /** interaction target — the "task" the partner must complete to open it */
  interactionHint?: string | null;
  locked: boolean;
  createdAt: string;
}

export type ConfessionVisibility = "private" | "revealed" | "reveal-on";

export interface Confession {
  id: string;
  relationshipId: string;
  authorId: string;
  authorName: string;
  text: string;
  media: MediaAsset[];
  visibility: ConfessionVisibility;
  revealAt?: string | null;
  createdAt: string;
}

export interface DictionaryEntry {
  id: string;
  relationshipId: string;
  word: string;
  meaning: string;
  inventorId?: string | null;
  inventorName?: string | null;
  origin?: string | null;
  example?: string | null;
  usedSince?: string | null;
  audio?: MediaAsset | null;
  createdAt: string;
}

export interface LittleThing {
  id: string;
  relationshipId: string;
  authorId: string;
  authorName: string;
  what: string;
  why?: string | null;
  date?: string | null;
  media: MediaAsset[];
  createdAt: string;
}

export interface FirstRecord {
  id: string;
  relationshipId: string;
  title: string;
  date?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  custom: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Place {
  id: string;
  relationshipId: string;
  name: string;
  latitude: number;
  longitude: number;
  date?: string | null;
  story?: string | null;
  memoryIds: string[];
  createdAt: string;
}

export interface SoundtrackSong {
  id: string;
  relationshipId: string;
  song: Song;
  memoryTitle?: string | null;
  why?: string | null;
  date?: string | null;
  createdAt: string;
}

export type GoalCategory = "love" | "career" | "home" | "travel" | "finances" | "family" | "adventures";

export interface FutureGoal {
  id: string;
  relationshipId: string;
  title: string;
  description?: string | null;
  category: GoalCategory;
  targetDate?: string | null;
  progress: number;
  imageUrl?: string | null;
  createdBy: string;
  createdByName: string;
  completed: boolean;
  createdAt: string;
}

export interface TimeCapsule {
  id: string;
  relationshipId: string;
  title: string;
  note?: string | null;
  createdAt: string;
  unlockAt: string;
  media: MediaAsset[];
  questions?: string[] | null;
  predictions?: string[] | null;
  status: "sealed" | "unlocked";
  openedAt?: string | null;
}

export interface Reflection {
  id: string;
  relationshipId: string;
  question: string;
  answer: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface SurvivedEntry {
  id: string;
  relationshipId: string;
  whatHappened: string;
  howIFelt: string;
  whatILearned: string;
  howWeResolved: string;
  doNotForget: string;
  resolved: boolean;
  createdAt: string;
  createdBy: string;
}

export interface RelationshipMemberView {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isOwner: boolean;
}

export interface Relationship {
  id: string;
  /** the code partners use to *join* the universe */
  code: string;
  /** the shared secret used to sign in (step 1 of login) */
  secretCode: string;
  name: string;
  startDate: string;
  title?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  members: RelationshipMemberView[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  avatarUrl?: string | null;
  relationshipId?: string | null;
}

export interface Statistics {
  daysTogether: number;
  years: number;
  months: number;
  days: number;
  memories: number;
  photos: number;
  videos: number;
  voiceNotes: number;
  places: number;
  letters: number;
  firsts: number;
  goalsCompleted: number;
  milestones: number;
}

export interface InvitationInfo {
  code: string;
  relationshipName: string;
  invitedBy: string;
  relationshipId: string;
}

export const MOODS: { value: Mood; label: string }[] = [
  { value: "joy", label: "Joy" },
  { value: "love", label: "Love" },
  { value: "laughter", label: "Laughter" },
  { value: "tenderness", label: "Tenderness" },
  { value: "peace", label: "Peace" },
  { value: "yearning", label: "Yearning" },
  { value: "ache", label: "Ache" },
  { value: "pride", label: "Pride" },
  { value: "grateful", label: "Grateful" },
  { value: "wonder", label: "Wonder" },
  { value: "homesick", label: "Homesick" },
  { value: "ordinary", label: "Ordinary" },
];

export const MEMORY_KINDS: { value: MemoryKind; label: string }[] = [
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
  { value: "voice", label: "Voice" },
  { value: "text", label: "Story" },
  { value: "conversation", label: "Conversation" },
  { value: "place", label: "Place" },
  { value: "milestone", label: "Milestone" },
  { value: "little-thing", label: "Little Thing" },
];

export const LETTER_CATEGORIES: { value: LetterCategory; label: string }[] = [
  { value: "to-you", label: "Letters to you" },
  { value: "what-i-love", label: "What I love about you" },
  { value: "never-forget", label: "Things I never want you to forget" },
  { value: "thank-you", label: "Thank you" },
  { value: "im-sorry", label: "I'm sorry" },
  { value: "future-wife", label: "Future wife" },
  { value: "future-husband", label: "Future husband" },
  { value: "future-family", label: "Future family" },
  { value: "when-were-old", label: "When we're old" },
];

export const GOAL_CATEGORIES: { value: GoalCategory; label: string; glyph: string }[] = [
  { value: "love", label: "Love", glyph: "❤" },
  { value: "career", label: "Career", glyph: "◆" },
  { value: "home", label: "Home", glyph: "◇" },
  { value: "travel", label: "Travel", glyph: "✈" },
  { value: "finances", label: "Finances", glyph: "◎" },
  { value: "family", label: "Family", glyph: "❋" },
  { value: "adventures", label: "Adventures", glyph: "✦" },
];

export const FIRST_CATEGORIES = [
  "Our first conversation",
  "Our first call",
  "Our first meeting",
  "Our first photo",
  "Our first date",
  "Our first gift",
  "Our first trip",
  "Our first I love you",
  "Our first anniversary",
  "Our first argument",
  "Our first major challenge",
  "Our first achievement together",
];

export const REFLECTION_QUESTIONS = [
  "What did you think we'd become?",
  "What do you love most about us now?",
  "What has changed since we began?",
  "What have we survived?",
  "What are you grateful for?",
  "What do you hope happens next?",
  "What moment did you replay the most this year?",
  "How have we grown, apart and together?",
  "What's something small that still makes you smile?",
  "If we could only keep one memory, which would it be?",
];