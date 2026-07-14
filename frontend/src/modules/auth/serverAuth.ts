import { cookies } from "next/headers";

export async function auth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const backendUrl =
      process.env.BACKEND_INTERNAL_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return { user };
  } catch (err) {
    console.error("Custom auth() fetch error:", err);
    return null;
  }
}
