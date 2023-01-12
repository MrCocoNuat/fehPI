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

export const HERO_STATS_FRAG = gql`
    fragment HeroStats on HeroDefinition {
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
    }
`

export const HERO_MOVEMENT_WEAPON_FRAG = gql`
    fragment HeroMovementWeapon on HeroDefinition {
        movementType
        weaponType
    }
`

export const HERO_FIVE_STAR_SKILLS_FRAG = gql`
    fragment HeroFiveStarSkills on HeroDefinition {
        skills(rarities: FIVE_STARS){
            known{
                id
                exclusive
                category
            }
            learnable{
              id
                exclusive
                category
            }
        }
    }
`

export const HERO_NAME_FRAG = gql`
    fragment HeroName on HeroDefinition{    
        name(language: $lang){
            value
        }
        epithet(language: $lang){
            value
        }
    }
`

export const SKILL_NAME_FRAG = gql`
    fragment SkillName on SkillDefinition {
        name(language: $lang){
            value
        }
    }
`

export const SKILL_RESTRICTIONS_FRAG = gql`
    fragment SkillRestrictions on SkillDefinition {
        exclusive
        category
        weaponEquip
        movementEquip
    }
`


