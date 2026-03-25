import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = { title: "BlueCollar", description: "Find Skilled Workers Near You" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
