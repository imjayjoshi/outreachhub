"use client";
import { useState, useEffect, useRef } from "react";
import { clearCredentials, authService } from "@/modules/auth";
import {
  useAppDispatch,
  useAppSelector,
  toggleSidebar,
} from "@/modules/shared";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { dashboardMenuItems } from "../config/menu";
import { LogOut, Menu, X, User } from "lucide-react";
import Image from "next/image";

interface AppShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Sign out failed:", e);
    }
    dispatch(clearCredentials());
    router.push("/login");
  };

  // Derive page title from the active menu item
  const activeItem = dashboardMenuItems.find(
    (item) => pathname === item.path || pathname.startsWith(item.path + "/"),
  );
  const pageTitle = activeItem?.title ?? "Dashboard";

  return (
    <div className="flex h-screen bg-midnight-bg text-midnight-text overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 220 : 64 }}
        className="relative z-20 flex flex-col h-full bg-midnight-surface border-r border-midnight-border shrink-0 select-none overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-3 border-b border-midnight-border">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden">
              <Image
                src="/careerflow.png"
                alt="CareerFlow Logo"
                fill
                sizes="32px"
                className="object-contain animate-fade-in"
              />
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-extrabold text-sm tracking-wider uppercase text-white"
              >
                Career<span className="text-midnight-secondary">Flow</span>
              </motion.span>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="text-midnight-muted hover:text-midnight-text p-1.5 rounded-md hover:bg-midnight-card/40 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {dashboardMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path ||
              (item.path !== "/dashboard" &&
                pathname.startsWith(item.path + "/"));

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`relative flex items-center gap-3 w-full px-3 h-10 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? "text-midnight-primary bg-midnight-card/60"
                    : "text-midnight-muted hover:text-midnight-text hover:bg-midnight-card/20"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-midnight-primary rounded-r-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    isActive
                      ? "text-midnight-primary"
                      : "text-midnight-muted group-hover:text-midnight-text"
                  }`}
                />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Panel */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-midnight-border bg-midnight-surface/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="text-midnight-muted hover:text-midnight-text hover:bg-midnight-card/40 p-1.5 rounded-md transition-all cursor-pointer"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-sm font-semibold tracking-wide uppercase text-white">
              {pageTitle}
            </h2>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight-card border border-midnight-border text-midnight-muted hover:text-midnight-text hover:bg-midnight-card/80 transition-all cursor-pointer shadow-sm"
            >
              <User className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-midnight-border bg-midnight-surface p-2 shadow-2xl z-50 text-left"
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-midnight-muted truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <div className="h-px bg-midnight-border my-2" />

                  <button
                    disabled
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-midnight-muted cursor-not-allowed text-left"
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer text-left font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-midnight-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
