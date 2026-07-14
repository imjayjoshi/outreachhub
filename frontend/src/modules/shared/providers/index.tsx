"use client";
import React from "react";
import { AuthProvider } from "./AuthProvider";
import { ReduxProvider } from "./ReduxProvider";
import { AuthSync } from "@/modules/auth/providers/AuthSync";

export interface CustomSession {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
}

export function RootProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: CustomSession | null;
}) {
  return (
    <AuthProvider session={session}>
      <ReduxProvider>
        <AuthSync>{children}</AuthSync>
      </ReduxProvider>
    </AuthProvider>
  );
}
