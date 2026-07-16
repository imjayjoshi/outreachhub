"use client";
import React, { useEffect } from "react";
import { useAppDispatch } from "@/modules/shared/redux/store";
import { setCredentials, clearCredentials } from "../redux/authSlice";

interface AuthSyncProps {
  children: React.ReactNode;
  serverUser?: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
}

/**
 * Syncs the server-side session into the Redux store on mount.
 * No client-side /auth/me fetch is needed — the session is already
 * validated server-side and passed down as a prop.
 */
export function AuthSync({ children, serverUser }: AuthSyncProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (serverUser) {
      dispatch(
        setCredentials({
          id: serverUser.id,
          name: serverUser.name,
          email: serverUser.email,
        }),
      );
    } else {
      dispatch(clearCredentials());
    }
  }, [dispatch, serverUser]);

  return <>{children}</>;
}
