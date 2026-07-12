import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth";
import {
  listCompanies,
  createCompany,
} from "@/modules/companies/queries/companyQueries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await listCompanies(session.user.id);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const company = await createCompany(session.user.id, body);
  return NextResponse.json(company, { status: 201 });
}
