import NextAuth from "next-auth";
import { authConfig } from "@/modules/auth/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/companies/:path*", "/campaigns/:path*"],
};
