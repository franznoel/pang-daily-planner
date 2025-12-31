"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export function makeApolloClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "/api/graphql",
    // Use global fetch explicitly to avoid weird bundling/polyfill edge cases
    fetch: (...args) => fetch(...args),
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
}
