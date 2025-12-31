"use client";

import React from "react";
import { ThemeRegistry } from "@/lib/ThemeRegistry";
import { ApolloWrapper } from "@/lib/ApolloWrapper";
import { AuthProvider } from "@/lib/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloWrapper>
      <ThemeRegistry>
        <AuthProvider>{children}</AuthProvider>
      </ThemeRegistry>
    </ApolloWrapper>
  );
}
