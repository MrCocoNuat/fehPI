import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { MovementType, SkillCategory, WeaponType } from "../pages/api/dao/types/dao-types";

export const apolloClient = new ApolloClient({
    uri: "/api/graphql",
    cache: new InMemoryCache({
        possibleTypes: {
            SkillDefinition: ["WeaponDefinition", "AssistDefinition", "SpecialDefinition", "PassiveSkillDefinition"]
        }
    }), // wooo free caching
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
                name(language: $lang){
                    value
                }
            }
            learnable{
              id
                exclusive
                category
                name(language: $lang){
                    value
                }
            }
        }
    }
`

export const HERO_NAME = "HeroName";
export const HERO_NAME_FRAG = gql`
    fragment ${HERO_NAME} on HeroDefinition{    
        name(language: $lang){
            value
        }
        epithet(language: $lang){
            value
        }
    }
`

/*
!!!
In Apollo Client,
Graphql fragments defined on interfaces like SkillDefinition will not populate fields of implementation types automatically!!

*/

export const SKILL_NAME = "SkillName";
export const SKILL_NAME_FRAG = gql`
    fragment ${SKILL_NAME} on SkillDefinition {
        name(language: $lang){
            value
        }
    }
`

export const SKILL_RESTRICTIONS = "SkillRestrictions";
export const SKILL_RESTRICTIONS_FRAG = gql`
    fragment ${SKILL_RESTRICTIONS} on SkillDefinition {
        exclusive
        enemyOnly
        category
        weaponEquip
        movementEquip
    }
`

