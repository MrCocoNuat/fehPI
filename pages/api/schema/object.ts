import { HeroDefinition, MovementType, ParameterPerStat, Series, SkillCategory, SkillDefinition, WeaponType } from "../../../types/dao-types";
import { MovementTypeEnum, SeriesEnum, SkillCategoryEnum, WeaponTypeEnum } from "./enum";
import { builder } from "./schema-builder";
import { getAllEnumValues } from "enum-for";
import { heroDao } from "../../../dao/dao-registry";

// From TypeScript Types, create ObjectRefs
export const SkillDefinitionObject = builder.objectRef<SkillDefinition>("SkillDefinition")
// then, implement them with GraphQL object/input types
.implement({
    description: "Details about a Skill",
    fields: (ofb) => ({
        // by choosing which fields to expose directly or resolve through a function
        idNum: ofb.exposeInt("idNum", {
            nullable: false, 
            description: "Unique numeric identifier",
        }),
        sortId: ofb.exposeInt("sortId", {
            nullable: false, 
            description: "Last key used when sorting Skills",
        }),
        idTag: ofb.exposeString("idTag", {
            nullable: false, 
            description: "Internal string identifier of Skill itself",
        }),
        nameId: ofb.exposeString("nameId", {
            nullable: false, 
            description: "String identifier for the name of the Skill"
        }),
        descId: ofb.exposeString("descId", {
            nullable: false, 
            description: "String identifier for the description of the Skill"
        }),
        prerequisites: ofb.field({
            type: ofb.listRef("String", {
                nullable: true
            }), 
            nullable: false, 
            resolve: (skillDefinition) => skillDefinition.prerequisites,
            description: "The previous Skills in this Skill's inheritance tree. Just one needs to be learned.",
        }),
        refineBase: ofb.exposeString("refineBase", {
            nullable: true, 
            description: "If this Skill is a refined weapon, the string identifier of the base weapon. Null otherwise.",
        }),
        nextSkill: ofb.exposeString("nextSkill", {
            nullable: true, 
            description: "The next Skill in this Skill's inheritance tree",
        }),
        exclusive: ofb.exposeBoolean("exclusive", {
            nullable: false, 
            description: "Whether this Skill is non-inheritable",
        }),
        enemyOnly: ofb.exposeBoolean("enemyOnly", {
            nullable: false, 
            description: "Whether this Skill is only equippable by story enemy units",
        }),
        arcaneWeapon: ofb.exposeBoolean("arcaneWeapon", {
            nullable: false, 
            description: "Whether this Skill is an arcane weapon",
        }),
        category: ofb.field({
            type: SkillCategoryEnum, 
            nullable: false,
            resolve: (skillDefinition) => skillDefinition.category, 
            description: "The category of this Skill",
        }),
        movEquip: ofb.field({
            type: ofb.listRef(MovementTypeEnum, {
                nullable: false
            }),
            nullable: false, 
            resolve: (skillDefinition) => getAllEnumValues(MovementType).filter(movementType => skillDefinition.movEquip[movementType]), 
            description: "The movement types that are allowed to equip this skill",
        }),
        wepEquip: ofb.field({
            type: ofb.listRef(WeaponTypeEnum, {
                nullable: false
            }),
            nullable: false, 
            resolve: (skillDefinition) => getAllEnumValues(WeaponType).filter(weaponType => skillDefinition.wepEquip[weaponType]), 
            description: "The weapon types that are allowed to equip this skill",
        }),
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
        idNum: ofb.exposeInt("idNum", {
            nullable: false, 
            description: "Unique numeric identifier",
        }),
        sortValue: ofb.exposeInt("sortValue", {
            nullable: false, 
            description: "Last key used when sorting",
        }),
        idTag: ofb.exposeString("idTag", {
            nullable: false, 
            description: "Internal string identifier of Hero",
        }),
        maxDragonflowers: ofb.int({
            nullable: false,
            resolve: (heroDefinition) => heroDefinition.dragonflowers.maxCount, 
            description: "Maximum amount of dragonflowers that can be applied",
        }),
        wepType: ofb.field({
            type: WeaponTypeEnum,
            nullable: false,
            resolve: (heroDefinition) => (heroDefinition.weaponType),
            description: "The Hero's weapon type",
        }),
        movType: ofb.field({
            type: MovementTypeEnum,
            nullable: false,
            resolve: (heroDefinition) => (heroDefinition.movementType),
            description: "The Hero's movement type",
        }),
        refresher: ofb.exposeBoolean("refresher", {
            nullable: false, 
            description: "Whether this Hero can equip Skills like Sing or Dance",
        }),
        baseStats: ofb.field({
            type: ParameterPerStatObject, 
            nullable: false,
            resolve: (heroDefinition) => (heroDefinition.baseStats), 
            description: "Base stats at Level 1, 3 stars. Note that final stats depend on rarity, level, and a predetermined growth vector for each Hero.",
        }),
        growthRates: ofb.field({
            type: ParameterPerStatObject, 
            nullable: false, 
            resolve: (heroDefinition) => (heroDefinition.growthRates), 
            description: "Growth rates for each stat. Note that final stats depend on rarity, level, and a predetermined growth vector for each Hero.",
        }),
        //TODO - after building stats calculation engine, expose that instead of these useless fields!
        series: ofb.field({
            type: SeriesEnum,
            nullable: false,
            resolve: (heroDefinition) => (heroDefinition.series),
            description: "The primary game that this Hero is from"
        }),
        origins: ofb.field({
            type: ofb.listRef(SeriesEnum, {
                nullable: false
            }),
            nullable: false,
            resolve: (heroDefinition) => getAllEnumValues(Series).filter(series => heroDefinition.origins[series]),
            description: "The games that this Hero is counted as being from"
        })
    }),
})
