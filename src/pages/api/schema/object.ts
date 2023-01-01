import { HeroDefinition, Language, Message, MovementType, OptionalLanguage, ParameterPerStat, Series, SkillDefinition, WeaponType } from "../../../dao/types/dao-types";
import { LanguageEnum, MovementTypeEnum, SeriesEnum, SkillCategoryEnum, WeaponTypeEnum } from "./enum";
import { builder } from "./schema-builder";
import { getAllEnumValues } from "enum-for";
import { messageDao, skillDao } from "../../../dao/dao-registry";

// From TypeScript Types, create ObjectRefs
export const SkillDefinitionObject = builder.loadableObjectRef<SkillDefinition, string>("SkillDefinition", {
    load: (idTags: string[]) => skillDao.getByIdTags(idTags),
});
// then, implement them with GraphQL object/input types
SkillDefinitionObject.implement({
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
        name: ofb.loadable({
            type: MessageObject,
            nullable: false,
            args: {
                language: ofb.arg({
                    type: LanguageEnum,
                    required: true,
                })
            },
            load: messageObjectLoader,
            resolve: messageObjectResolver("nameId"),
            description: "The Message holding the name of the Skill. Provide a NONE Language argument if you just want the key."
        }),
        desc: ofb.loadable({
            type: MessageObject,
            nullable: false,
            args: {
                language: ofb.arg({
                    type: LanguageEnum,
                    required: true,
                })
            },
            load: messageObjectLoader,
            resolve: messageObjectResolver("descId"),
            description: "The Message holding the description of the Skill. Provide a NONE Language argument if you just want the key."
        }),
        imageUrl: ofb.exposeString("imageUrl", {
            nullable: true,
            description: "FEH wiki URL of an image of this Skill's icon. Only exists for PASSIVE_* skills.",
        }),
        prerequisites: ofb.field({
            type: ofb.listRef(SkillDefinitionObject, {
                nullable: true
            }),
            nullable: false,
            resolve: (skillDefinition) => skillDefinition.prerequisites,
            description: "The previous Skills in this Skill's inheritance tree. Just one needs to be learned.",
        }),
        refineBase: ofb.field({
            type: SkillDefinitionObject,
            nullable: true,
            resolve: (skillDefinition) => skillDefinition.refineBase,
            description: "If this Skill is a refined weapon, the string identifier of the base weapon. Null otherwise.",
        }),
        nextSkill: ofb.field({
            type: SkillDefinitionObject,
            nullable: true,
            resolve: (skillDefinition) => skillDefinition.nextSkill,
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
            hp: ofb.exposeInt("hp", { nullable: false }),
            atk: ofb.exposeInt("atk", { nullable: false }),
            spd: ofb.exposeInt("spd", { nullable: false }),
            def: ofb.exposeInt("def", { nullable: false }),
            res: ofb.exposeInt("res", { nullable: false }),
        })
    })

export const HeroDefinitionObject = builder.objectRef<HeroDefinition>("HeroDefinition");
HeroDefinitionObject.implement({
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
        name: ofb.loadable({
            type: MessageObject,
            nullable: false,
            args: {
                language: ofb.arg({
                    type: LanguageEnum,
                    required: true,
                })
            },
            load: messageObjectLoader,
            resolve: messageObjectResolver("nameId"),
            description: "The Message holding the name of the Hero. Provide a NONE Language argument if you just want the key."
        }),
        epithet: ofb.loadable({
            type: MessageObject,
            nullable: false,
            args: {
                language: ofb.arg({
                    type: LanguageEnum,
                    required: true,
                })
            },
            load: messageObjectLoader,
            resolve: messageObjectResolver("epithetId"),
            description: "The Message holding the epithet of the Hero. Provide a NONE Language argument if you just want the key."
        }),
        imageUrl: ofb.exposeString("imageUrl", {
            nullable: true,
            description: "FEH wiki URL of an image of this Hero's face",
        }),
        maxDragonflowers: ofb.int({
            nullable: false,
            resolve: (heroDefinition) => heroDefinition.dragonflowers.maxCount,
            description: "Maximum number of dragonflowers that can be applied to this Hero",
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
        //TODO:- after building stats calculation engine, expose that instead of these useless fields!
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
            description: "The games that this Hero is considered to be from"
        }),
        skills: ofb.field({
            type: ofb.listRef(SkillDefinitionObject, {
                nullable: true
            }),
            nullable: false,
            args: {
                rarity: ofb.arg({
                    //TODO:- Much better to 1. give a list 2. constrain this to an Enum
                    type: "Int",
                    required: true,
                })
            },
            resolve: (heroDefinition, { rarity }) => heroDefinition.skills[rarity - 1],
            description: "The Skills that this Hero learns at each rarity"
        })
    }),
})


// Pothos does not support other than through a React Context, and in a standalone graphql api that does not make much sense...
// do a dumb hack to serialize both arguments (Language, key) into a single string key for the dataloader
//   we must additionally support the none Language, which is conveniently 4 chars as well >:)
//    of course can use numeric enum value instead but then going past 9 is really bad
// Additionally each field must be loaded separately since someone can want names in one language and descriptions in another language...

// yes this is pretty nasty type coercion all around. What can you do when serializing?
const messageObjectLoader = async (langPlusKeys: string[]) => {
    const keys = langPlusKeys.map(langPlusKey => langPlusKey.slice(4));
    // will never be called with 0 length array so deserializing the first element is ok
    const language = langPlusKeys[0].slice(0, 4) as keyof typeof OptionalLanguage;

    if (language === OptionalLanguage[OptionalLanguage.NONE]) {
        // caller specifically only wants keys
        return keys.map(key => ({ idTag: key })) as Message[];
    } else { // need to call dao
        return messageDao.getByMessageKeys(Language[language as keyof typeof Language], keys);
    }
}
function messageObjectResolver<Definition>(property: keyof Definition) {
    return (definition: Definition, { language }: { language: OptionalLanguage}) =>
        // stuff the language name into the key string, using the NULL_LANGUAGE string if needed
        `${OptionalLanguage[language]}${definition[property]}`
}

export const MessageObject = builder.objectRef<Message>("Message");
MessageObject.implement({
    description: "A key and its associated human-readable message in some language",
    fields: (ofb) => ({
        key: ofb.exposeString("idTag", {
            nullable: false,
            description: "The unique key of this Message",
        }),
        value: ofb.exposeString("value", {
            nullable: true,
            description: "The human-readable value of this Message in some language. Can be null.",
        })
    })
})