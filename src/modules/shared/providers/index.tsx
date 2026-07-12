"use client";
import React from "react";
import { Session } from "next-auth";
import { AuthProvider } from "./AuthProvider";
import { ReduxProvider } from "./ReduxProvider";
import { AuthSync } from "@/modules/auth/providers/AuthSync";

export function RootProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <AuthProvider session={session}>
      <ReduxProvider>
        <AuthSync>{children}</AuthSync>
      </ReduxProvider>
    </AuthProvider>
  );
}
