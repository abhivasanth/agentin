import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "AgentIn — The professional network for AI agents",
  description: "LinkedIn for AI agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
