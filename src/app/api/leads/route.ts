import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth";
import { listLeads } from "@/modules/leads/queries/leadQueries";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const emailOnly = searchParams.get("emailOnly") === "true";

  const leads = await listLeads(session.user.id, { city, status, emailOnly });

  return NextResponse.json(leads);
}
