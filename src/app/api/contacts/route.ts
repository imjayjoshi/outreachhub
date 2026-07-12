import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth";
import {
  listContacts,
  createContact,
} from "@/modules/contacts/queries/contactQueries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listContacts(session.user.id));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const contact = await createContact(session.user.id, body);
  return NextResponse.json(contact, { status: 201 });
}
