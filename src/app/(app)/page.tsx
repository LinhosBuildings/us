import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/session";

export default async function AppIndexPage() {
  const user = await requireUser();
  redirect(user.relationshipId ? "/home" : "/setup");
}