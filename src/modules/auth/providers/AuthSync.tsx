"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/modules/shared/redux/store";
import { setCredentials, clearCredentials } from "../redux/authSlice";

export function AuthSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      dispatch(
        setCredentials({
          id: session.user.id || "",
          name: session.user.name,
          email: session.user.email,
        }),
      );
    } else if (status === "unauthenticated") {
      dispatch(clearCredentials());
    }
  }, [session, status, dispatch]);

  return <>{children}</>;
}
