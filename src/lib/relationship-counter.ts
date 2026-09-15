export interface RelationshipCounter {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  isAnniversary: boolean;
  yearsTogether: number;
}

export function computeCounter(startDate: string, now: Date | number = new Date()): RelationshipCounter {
  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0, totalHours: 0, totalMinutes: 0, isAnniversary: false, yearsTogether: 0 };
  }
  const nowDate = now instanceof Date ? now : new Date(now);

  const totalDays = Math.max(0, Math.floor((nowDate.getTime() - start.getTime()) / 86_400_000));

  let years = nowDate.getFullYear() - start.getFullYear();
  let months = nowDate.getMonth() - start.getMonth();
  let days = nowDate.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(nowDate.getFullYear(), nowDate.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const isAnniversary =
    nowDate.getDate() === start.getDate() && nowDate.getMonth() === start.getMonth();

  return {
    years,
    months,
    days,
    hours: nowDate.getHours(),
    minutes: nowDate.getMinutes(),
    seconds: nowDate.getSeconds(),
    totalDays,
    totalHours: totalDays * 24 + nowDate.getHours(),
    totalMinutes: totalDays * 1440,
    isAnniversary,
    yearsTogether: years + (isAnniversary ? 1 : 0),
  };
}

export function counterSentence(counter: RelationshipCounter, andSeparator = ", ") {
  const parts: string[] = [];
  if (counter.years > 0) parts.push(`${counter.years} ${counter.years === 1 ? "year" : "years"}`);
  if (counter.months > 0) parts.push(`${counter.months} ${counter.months === 1 ? "month" : "months"}`);
  parts.push(`${counter.days} ${counter.days === 1 ? "day" : "days"}`);
  if (parts.length > 1) {
    const last = parts.pop()!;
    return `${parts.join(andSeparator)} and ${last}`;
  }
  return parts[0] ?? "0 days";
}