import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { MovementType, SkillCategory, WeaponType } from "../pages/api/dao/types/dao-types";

export const apolloClient = new ApolloClient({
    uri: "/api/graphql",
    cache: new InMemoryCache(), // wooo free caching
    assumeImmutableResults: true, // a real luxury
})


export const PING = gql`{
    ping
  }`

export const GET_SINGLE_HERO = gql`query getHero($idNum: Int!){
    heroes(idNums: [$idNum]){
        idNum
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
        movementType
        weaponType
        skills(rarities: FIVE_STARS){
            known{
                idNum
                exclusive
            }
            learnable{
                idNum
                exclusive
            }
        }
    }
}
`;

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
export type AllHeroNames = { idNum: number, name: { value: string }, epithet: { value: string } }[];

export const GET_ALL_SKILL_NAMES_EXCLUSIVITIES = gql`query getAllSkillExclusivityCategory($lang: OptionalLanguage!){
    skills{
        idNum
        exclusive
        category
        weaponEquip
        movementEquip
        name(language: $lang){
            value
        }
    }
}`
export type AllSkillExclusivities = {
    idNum: number,
    exclusive: boolean,
    category: SkillCategory,
    weaponEquip: (keyof typeof WeaponType)[],
    movementEquip: (keyof typeof MovementType)[],
    name: { value: string },
}[]

export const GET_GROWTH_VECTORS = gql`query getGrowthVectors{
    growthVectors
}`;