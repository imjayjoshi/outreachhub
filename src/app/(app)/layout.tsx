import { redirect } from "next/navigation";
import { auth } from "@/modules/auth";
import { AppShell } from "@/modules/dashboard";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <AppShell user={session.user}>{children}</AppShell>;
}
