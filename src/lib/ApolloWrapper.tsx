"use client";

import React, { useMemo } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { makeApolloClient } from "./apollo-client";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => makeApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
