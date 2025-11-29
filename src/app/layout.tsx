import type { Metadata } from "next";
import { ThemeRegistry } from "@/lib/ThemeRegistry";
import { ApolloWrapper } from "@/lib/ApolloWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pang Daily Planner",
  description: "A daily planner application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>
          <ThemeRegistry>{children}</ThemeRegistry>
        </ApolloWrapper>
      </body>
    </html>
  );
}
