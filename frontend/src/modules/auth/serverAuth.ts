import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Server-side auth check — calls the backend /auth/me endpoint with the
 * token cookie and returns the session user.
 *
 * Wrapped in React.cache() so that multiple server components calling auth()
 * in the same request (RootLayout → AppLayout → Page) share a single fetch
 * instead of hitting the backend 3 times.
 */
export const auth = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const backendUrl =
      process.env.BACKEND_INTERNAL_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/v1/auth/me`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store", // don't cache across requests, only within the same render
    });
    if (!res.ok) return null;
    const user = await res.json();
    return { user };
  } catch (err) {
    console.error("Custom auth() fetch error:", err);
    return null;
  }
});
