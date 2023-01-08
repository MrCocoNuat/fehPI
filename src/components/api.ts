import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

export const apolloClient = new ApolloClient({
    // when in dev mode, for some reason the server tries to make a query too
    // but a relative URL obviously cannot be accessed by the server that does not know its own origin
    // so when not in prod, just provide the whole local URL
    uri: "/api/graphql",
    cache: new InMemoryCache(), // wooo free caching
    assumeImmutableResults: true, // a real luxury
})


export const PING = gql`{
    ping
  }`

export const GET_SINGLE_HERO = gql`query getHero($idNum: Int!){
    heroes(idNums: [$idNum]){
        idTag
        imageUrl
        baseStats {
            hp
            atk
            spd
            def
            res
        }
        growthRates {
            hp
            atk
            spd
            def
            res
        }
        baseVectorId
        maxDragonflowers
    }
}`;

export const GET_ALL_HERO_NAMES = gql`query getAllHeroNames($lang: OptionalLanguage!){
    heroes{
        idNum
        name(language: $lang){
            value
        }
        epithet(language: $lang){
            value
        }
    }
}
`;

export const GET_GROWTH_VECTORS = gql`query getGrowthVectors{
    growthVectors
}`;