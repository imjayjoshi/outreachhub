"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/modules/shared/redux/store";
import { setCredentials, clearCredentials } from "../redux/authSlice";
import { authService } from "../services/authService";

export function AuthSync({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((data) => {
        if (active && data) {
          dispatch(
            setCredentials({
              id: data.id || "",
              name: data.name,
              email: data.email,
            }),
          );
        }
      })
      .catch(() => {
        if (active) {
          dispatch(clearCredentials());
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight-bg text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-midnight-primary border-t-transparent" />
          <span className="text-sm text-midnight-muted">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
