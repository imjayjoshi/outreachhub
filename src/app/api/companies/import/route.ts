import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth";
import { prisma } from "@/modules/shared/database/prisma";

interface ImportRow {
  companyName: string;
  website?: string;
  location?: string;
  industry?: string;
  contactName: string;
  email: string;
  role?: string;
  phone?: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rows } = (await req.json()) as { rows: ImportRow[] };
    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let importedCount = 0;

    // Process in transaction or loop
    for (const row of rows) {
      if (!row.companyName || !row.email) continue;

      // 1. Find or create company
      let company = await prisma.company.findFirst({
        where: {
          userId: session.user.id,
          name: { equals: row.companyName, mode: "insensitive" },
        },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            userId: session.user.id,
            name: row.companyName,
            website: row.website || null,
            location: row.location || null,
            industry: row.industry || null,
          },
        });
      }

      // 2. Find or create contact
      const contactExists = await prisma.contact.findFirst({
        where: {
          userId: session.user.id,
          email: { equals: row.email, mode: "insensitive" },
          companyId: company.id,
        },
      });

      if (!contactExists) {
        await prisma.contact.create({
          data: {
            userId: session.user.id,
            companyId: company.id,
            name: row.contactName || "Unknown",
            email: row.email,
            role: row.role || null,
            phone: row.phone || null,
          },
        });
        importedCount++;
      }
    }

    return NextResponse.json({ success: true, imported: importedCount });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Import failed";
    console.error("[importCompanies] Import failed:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
