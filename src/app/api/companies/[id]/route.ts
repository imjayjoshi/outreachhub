import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth";
import {
  getCompany,
  updateCompany,
  deleteCompany,
} from "@/modules/companies/queries/companyQueries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const company = await getCompany(session.user.id, id);
  if (!company)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(company);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await updateCompany(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteCompany(id);
  return NextResponse.json({ success: true });
}
