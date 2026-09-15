import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/contracts";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code || code.length < 4) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  const store = await getStore();
  const rel = await store.getRelationshipByCode(code.trim());
  if (!rel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const owner = rel.members.find((m) => m.isOwner);
  return NextResponse.json({
    code: rel.code,
    relationshipName: rel.name,
    invitedBy: owner?.name ?? "Alex & Maya",
  });
}