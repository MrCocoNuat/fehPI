import { ApolloClient, InMemoryCache } from "@apollo/client";

export const apolloClient = new ApolloClient({
    // when in dev mode, for some reason the server tries to make a query too
    // but a relative URL obviously cannot be accessed by the server that does not know its own origin
    // so when not in prod, just provide the whole local URL
    uri: (process.env.NODE_ENV === "production")? "/api/graphql" : "http://localhost:3000/api/graphql",
    cache: new InMemoryCache(),
})