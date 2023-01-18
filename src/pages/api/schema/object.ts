import { assertIsAssistDefinition, assertIsPassiveSkillDefinition, assertIsSpecialDefinition, assertIsWeaponDefinition, AssistDefinition, HeroDefinition, HeroSkills, Language, Message, MovementType, OptionalLanguage, ParameterPerStat, PassiveSkillDefinition, Series, SkillDefinition, SpecialDefinition, Stat, WeaponDefinition, WeaponType } from "../dao/types/dao-types";
import { OptionalLanguageEnum, MovementTypeEnum, SeriesEnum, SkillCategoryEnum, WeaponTypeEnum, RarityEnum, RefineTypeEnum } from "./enum";
import { builder } from "./schema-builder";
import { getAllEnumValues } from "enum-for";
import { heroDao, messageDao, skillDao } from "../dao/dao-registry";

// From TypeScript Types, create ObjectRefs/InterfaceRefs
export const SkillDefinitionInterface = builder.loadableInterfaceRef<SkillDefinition, string>("SkillDefinition", {
    // this one is dataloadable - one query that generates many SkillDefinitions can instead generate keys (here of type string) that get looked up all at once
    load: (idTags: string[]) => skillDao.getByIdTags(idTags),
});
// then, implement them with GraphQL object/input types
SkillDefinitionInterface.implement({
    description: "Details about a generic Skill",
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
                    type: OptionalLanguageEnum,
                    required: true,
                })
            },
            ...messageObjectLoadAndResolve("nameId"),
            description: "The Message holding the name of the Skill. Provide a NONE Language argument if you just want the key."
        }),
        desc: ofb.loadable({
            type: MessageObject,
            nullable: false,
            args: {
                language: ofb.arg({
                    type: OptionalLanguageEnum,
                    required: true,
                })
            },
            ...messageObjectLoadAndResolve("descId"),
            description: "The Message holding the description of the Skill. Provide a NONE Language argument if you just want the key."
        }),
        prerequisites: ofb.field({
            type: ofb.listRef(SkillDefinitionInterface, {
                nullable: false
            }),
            nullable: false,
            resolve: (skillDefinition) => skillDefinition.prerequisites,
            description: "The previous Skills in this Skill's inheritance tree; if there are any, only one needs to be learned.",
        }),
        nextSkill: ofb.field({
            type: SkillDefinitionInterface,
            nullable: true,
            resolve: (skillDefinition) => skillDefinition.nextSkill,
            description: "The next Skill in this Skill's inheritance tree if there is one, null otherwise. Note that if multiple Skills have this Skill as a prerequisite, only one will be here",
        }),
        exclusive: ofb.exposeBoolean("exclusive", {
            nullable: false,
            description: "Whether this Skill is non-inheritable",
        }),
        enemyOnly: ofb.exposeBoolean("enemyOnly", {
            nullable: false,
            description: "Whether this Skill is only equippable by story enemy units",
        }),

        category: ofb.field({
            type: SkillCategoryEnum,
            nullable: false,
            resolve: (skillDefinition) => skillDefinition.category,
            description: "The category of this Skill",
        }),
        movementEquip: ofb.field({
            type: ofb.listRef(MovementTypeEnum, {
                nullable: false
            }),
            nullable: false,
            resolve: (skillDefinition) => getAllEnumValues(MovementType).filter(movementType => skillDefinition.movEquip[movementType]),
            description: "The movement types that are allowed to equip this skill",
        }),
        weaponEquip: ofb.field({
            type: ofb.listRef(WeaponTypeEnum, {
                nullable: false
            }),
            nullable: false,
            resolve: (skillDefinition) => getAllEnumValues(WeaponType).filter(weaponType => skillDefinition.wepEquip[weaponType]),
            description: "The weapon types that are allowed to equip this skill",
        }),
    }),
})




export const WeaponDefinitionObject = builder.loadableObjectRef<WeaponDefinition, string>("WeaponDefinition", {
    load: (idTags: string[]) => skillDao.getByIdTags(idTags) as Promise<WeaponDefinition[]>,
});
WeaponDefinitionObject.implement({
    description: "Details about a Weapon Skill",
    interfaces: [SkillDefinitionInterface],
    isTypeOf: (value) => (assertIsWeaponDefinition(value as SkillDefinition)),
    fields: (ofb) => ({
        might: ofb.exposeInt("might", {
            nullable: false,
            description: "The inherent offensive power of this Weapon. Note that this includes any boost to ATK from a refine.",
        }),
        range: ofb.exposeInt("range", {
            nullable: false,
            description: "The range from which this Weapon attacks"
        }),
        refineBase: ofb.field({
            type: WeaponDefinitionObject,
            nullable: true,
            resolve: (weaponDefinition) => weaponDefinition.refineBase,
            description: "If this Weapon is refined, the SkillDefinition of the base weapon. Null otherwise.",
        }),
        refineStats: ofb.field({
            type: ParameterPerStatObject,
            nullable: true,
            resolve: (weaponDefinition) => (weaponDefinition.refined ? weaponDefinition.refineStats : null),
            description: "If this Weapon is refined, the stats conferred by the refine. Null otherwise. Note that refined weapon might includes any boost to ATK listed here."
        }),
        refineType: ofb.field({
            type: RefineTypeEnum,
            nullable: false,
            resolve: (weaponDefinition) => weaponDefinition.refineType,
            description: "The type of refine. Non-staff refines are NONE, EFFECT, or a stat. Staff refines are NONE, EFFECT, DAZZLING, or WRATHFUL. EFFECT refines are only applicable to exclusive weapons."
        }),
        refines: ofb.field({
            type: ofb.listRef(WeaponDefinitionObject, { nullable: false }),
            nullable: false,
            resolve: (weaponDefinition) => weaponDefinition.refines,
            description: "If this Weapon is unrefined, the SkillDefinitions of the refine options. Empty otherwise. Weapon evolutions are not included."
        }),
        arcaneWeapon: ofb.exposeBoolean("arcaneWeapon", {
            nullable: false,
            description: "Whether this Weapon is an arcane weapon",
        }),
        refined: ofb.exposeBoolean("refined", {
            nullable: false,
            description: "Whether this Weapon is refined"
        }),
        imageUrl: ofb.exposeString("imageUrl", {
            nullable: true,
            description: "FEH wiki URL of an image of this Skill's icon if it is a EFFECT-refined weapon. Null otherwise."
        })
    })
})

export const AssistDefinitionObject = builder.loadableObjectRef<AssistDefinition, string>("AssistDefinition", {
    load: (idTags: string[]) => skillDao.getByIdTags(idTags) as Promise<AssistDefinition[]>,
});
AssistDefinitionObject.implement({
    description: "Details about an Assist Skill",
    interfaces: [SkillDefinitionInterface],
    isTypeOf: (value) => (assertIsAssistDefinition(value as SkillDefinition)),
    fields: (ofb) => ({
        range: ofb.exposeInt("range", {
            nullable: false,
            description: "The range from which this Assist Skill operates",
        }),
    }),
})

export const SpecialDefinitionObject = builder.loadableObjectRef<SpecialDefinition, string>("SpecialDefinition", {
    load: (idTags: string[]) => skillDao.getByIdTags(idTags) as Promise<SpecialDefinition[]>,
});
SpecialDefinitionObject.implement({
    description: "Details about a Special Skill",
    interfaces: [SkillDefinitionInterface],
    isTypeOf: (value) => (assertIsSpecialDefinition(value as SkillDefinition)),
    fields: (ofb) => ({
        cooldownCount: ofb.exposeInt("cooldownCount", {
            nullable: false,
            description: "The cooldown count of this Special Skill",
        }),
    }),
})

export const PassiveSkillDefinitionObject = builder.loadableObjectRef<PassiveSkillDefinition, string>("PassiveSkillDefinition", {
    load: (idTags: string[]) => skillDao.getByIdTags(idTags) as Promise<PassiveSkillDefinition[]>,
});
PassiveSkillDefinitionObject.implement({
    description: "Details about a Passive Skill - A, B, C, or S",
    interfaces: [SkillDefinitionInterface],
    isTypeOf: (value) => (assertIsPassiveSkillDefinition(value as SkillDefinition)),
    fields: (ofb) => ({
        imageUrl: ofb.exposeString("imageUrl", {
            nullable: false,
            description: "FEH wiki URL of an image of this Passive Skill's icon",
        }),
    }),
})

export const ParameterPerStatObject = builder.objectRef<ParameterPerStat>("ParameterPerStat")
    .implement({
        description: "An object holding one integer parameter for each stat",
        fields: (ofb) => ({
            hp: ofb.exposeInt(Stat.HP, { nullable: false }),
            atk: ofb.exposeInt(Stat.ATK, { nullable: false }),
            spd: ofb.exposeInt(Stat.SPD, { nullable: false }),
            def: ofb.exposeInt(Stat.DEF, { nullable: false }),
            res: ofb.exposeInt(Stat.RES, { nullable: false }),
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
                    type: OptionalLanguageEnum,
                    required: true,
                })
            },
            ...messageObjectLoadAndResolve("nameId"),
            description: "The Message holding the name of the Hero. Provide a NONE Language argument if you just want the key."
        }),
        epithet: ofb.loadable({
            type: MessageObject,
            nullable: false,
            args: {
                language: ofb.arg({
                    type: OptionalLanguageEnum,
                    required: true,
                })
            },
            ...messageObjectLoadAndResolve("epithetId"),
            description: "The Message holding the epithet of the Hero. Provide a NONE Language argument if you just want the key."
        }),
        imageUrl: ofb.exposeString("imageUrl", {
            nullable: true,
            description: "FEH wiki URL of an image of this Hero's face. Other images are not supported at the moment.",
        }),
        maxDragonflowers: ofb.int({
            nullable: false,
            resolve: (heroDefinition) => heroDefinition.dragonflowers.maxCount,
            description: "Maximum number of dragonflowers that can be applied to this Hero",
        }),
        weaponType: ofb.field({
            type: WeaponTypeEnum,
            nullable: false,
            resolve: (heroDefinition) => (heroDefinition.weaponType),
            description: "The Hero's weapon type",
        }),
        movementType: ofb.field({
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
        baseVectorId: ofb.exposeInt("baseVectorId", {
            nullable: false,
            description: "A characteristic growth vector id for each Hero. Note that final stats depend on rarity, level, and a predetermined growth vector for each Hero."
        }),
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
            type: ofb.listRef(HeroSkillsObject, {
                nullable: true
            }),
            nullable: false,
            args: {
                rarities: ofb.arg({
                    type: ofb.arg.listRef(RarityEnum, {
                        required: true
                    }),
                    required: true,
                })
            },
            resolve: (heroDefinition, { rarities }) =>
                rarities
                    .map(rarity => heroDefinition.skills[rarity])
                    .map(fourteenSkillsList => ({
                        // come on ts please know that something passing through filter nonnull is not null...
                        known: fourteenSkillsList.slice(0, 6).filter(skill => skill !== null) as string[],
                        learnable: fourteenSkillsList.slice(6).filter(skill => skill !== null) as string[]
                    })),
            description: "The Skills that this Hero knows and can learn at each rarity or higher"
        })
    }),
})

const HeroSkillsObject = builder.objectRef<HeroSkills>("HeroSkills");
HeroSkillsObject.implement({
    description: "The Skills a Hero knows and can learn at a particular rarity or higher",
    fields: (ofb) => ({
        known: ofb.field({
            type: ofb.listRef(SkillDefinitionInterface, {
                nullable: false
            }),
            nullable: false,
            resolve: (heroSkills) => heroSkills.known,
            description: "The Skills a Hero knows at a particular rarity or higher. There is at most one of each SkillCategory"
        }),
        learnable: ofb.field({
            type: ofb.listRef(SkillDefinitionInterface, {
                nullable: false
            }),
            nullable: false,
            resolve: (heroSkills) => heroSkills.learnable,
            description: "The Skills a Hero can at a particular rarity or higher. There can be more than one of each SkillCategory, e.g. Legendary/Mythic remix skills"
        }),
    })
})


// Pothos does not support other than through a React Context, and in a standalone graphql api that does not make much sense...
// do a dumb hack to serialize both arguments (Language, key) into a single string key for the dataloader
//   we must additionally support the none Language, which is conveniently 4 chars as well >:)
//    of course can use numeric enum value instead but then going past 9 is really bad
// Additionally each field must be loaded separately since someone can want names in one language and descriptions in another language...

// yes this is pretty nasty type coercion all around. What can you do when serializing?
const messageObjectLoader = async (langPlusKeys: string[]) => {
    const keys = langPlusKeys.map(langPlusKey => JSON.parse(langPlusKey).key);
    // will never be called with 0 length array so deserializing the first element is ok
    const language = JSON.parse(langPlusKeys[0]).lang as keyof typeof OptionalLanguage;

    if (language === OptionalLanguage[OptionalLanguage.NONE]) {
        // caller specifically only wants keys
        return keys.map(key => ({ idTag: key })) as Message[];
    } else { // need to call dao
        return messageDao.getByMessageKeys(Language[language as keyof typeof Language], keys);
    }
}
function messageObjectResolver<Definition>(property: keyof Definition) {
    return (definition: Definition, { language }: { language: OptionalLanguage }) =>
        // stuff the language name into the key string, using the NULL_LANGUAGE string if needed
        JSON.stringify({ lang: OptionalLanguage[language], key: definition[property] })
}
// destructure this directly - encapsulates at least a little
function messageObjectLoadAndResolve<Definition>(property: keyof Definition) {
    return ({
        load: messageObjectLoader,
        resolve: messageObjectResolver(property),
    })
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