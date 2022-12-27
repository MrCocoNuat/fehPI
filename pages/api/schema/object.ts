import { HeroDefinition, ParameterPerStat, SkillDefinition } from "../../../types/dao-types";
import { builder } from "./schema-builder";

// From TypeScript Types, create ObjectRefs
export const SkillDefinitionObject = builder.objectRef<SkillDefinition>("SkillDefinition")
// then, implement them with GraphQL object/input types
.implement({
    description: "Details about a Skill",
    fields: (ofb) => ({
        // by choosing which fields to expose directly or resolve through a function
        idNum: ofb.exposeInt("idNum", {nullable: false, description: "Unique numeric identifier"}),
        sortId: ofb.exposeInt("sortId", {nullable: false, description: "Last key used when sorting Skills"}),
        idTag: ofb.exposeString("idTag", {nullable: false, description: "Internal string identifier of Skill itself"}),
        nameId: ofb.exposeString("nameId", {nullable: false, description: "String identifier for the name of the Skill"}),
        descId: ofb.exposeString("descId", {nullable: false, description: "String identifier for the description of the Skill"}),
        prerequisites: ofb.field({type: ofb.listRef("String", {nullable: true}), resolve: (skillDefinition) => skillDefinition.prerequisites, nullable: false, description: "The previous Skills in this Skill's inheritance tree. Just one needs to be learned."}),
        refineBase: ofb.exposeString("refineBase", {nullable: true, description: "If this Skill is a refined weapon, the string identifier of the base weapon. Null otherwise."}),
        nextSkill: ofb.exposeString("nextSkill", {nullable: true, description: "The next Skill in this Skill's inheritance tree"}),
        exclusive: ofb.exposeBoolean("exclusive", {nullable: false, description: "Whether this Skill is non-inheritable"}),
        enemyOnly: ofb.exposeBoolean("enemyOnly", {nullable: false, description: "Whether this Skill is only equippable by story enemy units"}),
        arcaneWeapon: ofb.exposeBoolean("arcaneWeapon", {nullable: false, description: "Whether this Skill is an arcane weapon"}),
        //TODO- the missing ones require some resolves and enums
    }),
})

export const ParameterPerStatObject = builder.objectRef<ParameterPerStat>("ParameterPerStat")
.implement({
    description: "An object holding one integer parameter for each stat",
    fields: (ofb) => ({
        hp: ofb.exposeInt("hp", {nullable: false}),
        atk: ofb.exposeInt("atk", {nullable: false}),
        spd: ofb.exposeInt("spd", {nullable: false}),
        def: ofb.exposeInt("def", {nullable: false}),
        res: ofb.exposeInt("res", {nullable: false}),
    })
})

export const HeroDefinitionObject = builder.objectRef<HeroDefinition>("HeroDefinition")
.implement({
    description: "Details about a Hero",
    fields: (ofb) => ({
        idNum: ofb.exposeInt("idNum", {nullable: false, description: "Unique numeric identifier"}),
        sortValue: ofb.exposeInt("sortValue", {nullable: false, description: "Last key used when sorting"}),
        idTag: ofb.exposeString("idTag", {nullable: false, description: "Internal string identifier of Hero"}),
        maxDragonflowers: ofb.int({resolve: (heroDefinition) => heroDefinition.dragonflowers.maxCount, nullable: false, description: "Maximum amount of dragonflowers that can be applied"}),
        refresher: ofb.exposeBoolean("refresher", {nullable: false, description: "Whether this Hero can equip Skills like Sing or Dance"}),
        baseStats: ofb.field({type: ParameterPerStatObject, resolve: (heroDefinition) => (heroDefinition.baseStats), nullable: false, description: "Base stats at Level 1, 3 stars. Note that final stats depend on rarity, level, and a predetermined growth vector for each Hero."}),
        growthRates: ofb.field({type: ParameterPerStatObject, resolve: (heroDefinition) => (heroDefinition.growthRates), nullable: false, description: "Growth rates for each stat. Note that final stats depend on rarity, level, and a predetermined growth vector for each Hero."}),
        //TODO- the missing ones require some resolves and enums
    }),
})
