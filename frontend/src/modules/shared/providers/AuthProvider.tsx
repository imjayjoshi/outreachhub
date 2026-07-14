"use client";
import React from "react";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return <>{children}</>;
}
