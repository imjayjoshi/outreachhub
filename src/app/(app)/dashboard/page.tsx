import { redirect } from "next/navigation";
import { auth } from "@/modules/auth";
import { DashboardClient } from "@/modules/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardClient user={session.user} />;
}
