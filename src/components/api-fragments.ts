import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { MovementType, SkillCategory, WeaponType } from "../pages/api/dao/types/dao-types";

export const apolloClient = new ApolloClient({
    uri: "/api/graphql",
    cache: new InMemoryCache({
        possibleTypes: {
            SkillDefinition: ["WeaponDefinition", "AssistDefinition", "SpecialDefinition", "PassiveSkillDefinition"]
        },
        typePolicies:{
            HeroDefinition:{
                keyFields: ["idNum"],
            },
            SkillDefinition: {
                keyFields: ["idNum"],
            }
        }
    }), // wooo free caching
    assumeImmutableResults: true, // a real luxury
})


export const PING = gql`{
    ping
  }`


export const INCLUDE_FRAG = (fragmentName: string) => `...${fragmentName}`;

export const HERO_STATS = "HeroStats";
export const HERO_STATS_FRAG = gql`
    fragment ${HERO_STATS} on HeroDefinition {
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

export const HERO_MAX_DRAGONFLOWERS = "HeroMaxDragonflowers";
export const HERO_MAX_DRAGONFLOWERS_FRAG = gql`
    fragment ${HERO_MAX_DRAGONFLOWERS} on HeroDefinition {
        maxDragonflowers
    }
`

export const HERO_MOVEMENT_WEAPON = "HeroMovementWeapon";
export const HERO_MOVEMENT_WEAPON_FRAG = gql`
    fragment ${HERO_MOVEMENT_WEAPON} on HeroDefinition {
        movementType
        weaponType
    }
`

export const HERO_FIVE_STAR_SKILLS = "HeroFiveStarSkills";
export const HERO_FIVE_STAR_SKILLS_FRAG = gql`
    fragment ${HERO_FIVE_STAR_SKILLS} on HeroDefinition {
        skills(rarities: FIVE_STARS){
            known{
                idNum
                exclusive
                category
                name(language: $lang){
                    value
                }
            }
            learnable{
                idNum
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

export const HERO_IMAGE_URL = "HeroImageUrl";
export const HERO_IMAGE_URL_FRAG = gql`
    fragment ${HERO_IMAGE_URL} on HeroDefinition{
        imageUrl
        resplendentImageUrl
    }
`

export const HERO_RESPLENDENT = "HeroResplendent";
export const HERO_RESPLENDENT_FRAG = gql`
    fragment ${HERO_RESPLENDENT} on HeroDefinition{
        resplendentExists
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

export const PASSIVE_SKILL_IMAGE_URL = "SkillImageUrl";
export const PASSIVE_SKILL_IMAGE_URL_FRAG = gql`
    fragment ${PASSIVE_SKILL_IMAGE_URL} on PassiveSkillDefinition {
        imageUrl
    }
`
export const WEAPON_REFINES = "WeaponRefines";
export const WEAPON_REFINES_FRAG = gql`
    fragment ${WEAPON_REFINES} on WeaponDefinition {
        refines{
            idNum
            refineType
        }
    }
`

export const WEAPON_IMAGE_URL = "WeaponImageUrl";
export const WEAPON_IMAGE_URL_FRAG = gql`
    fragment ${WEAPON_IMAGE_URL} on WeaponDefinition {
        imageUrl
    }
`