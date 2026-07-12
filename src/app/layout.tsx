import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/AuthProvider";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { AuthSync } from "@/providers/AuthSync";
import { auth } from "@/lib/auth";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "CareerFlow",
  description: "Accelerate your career outreach and job flow.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={cn("h-full", "antialiased", poppins.variable)}>
      <body className={cn("min-h-full flex flex-col", poppins.className)}>
        <AuthProvider session={session}>
          <ReduxProvider>
            <AuthSync>{children}</AuthSync>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
