export enum SkillCategory {
    WEAPON,
    ASSIST,
    SPECIAL,
    PASSIVE_A,
    PASSIVE_B,
    PASSIVE_C,
    PASSIVE_S,
    REFINE_EFFECT,
    BEAST_EFFECT,
};
export type SkillCategoryName = keyof typeof SkillCategory;

export enum MovementType {
    INFANTRY,
    ARMORED,
    CAVALRY,
    FLIER,
};
export type MovementTypeName = keyof typeof MovementType;
export type MovementTypeBitfield = { [movementTypeId in MovementType]: boolean };

export enum WeaponType {
    SWORD,
    LANCE,
    AXE,
    RED_BOW,
    BLUE_BOW,
    GREEN_BOW,
    COLORLESS_BOW,
    RED_DAGGER,
    BLUE_DAGGER,
    GREEN_DAGGER,
    COLORLESS_DAGGER,
    RED_TOME,
    BLUE_TOME,
    GREEN_TOME,
    COLORLESS_TOME,
    STAFF,
    RED_BREATH,
    BLUE_BREATH,
    GREEN_BREATH,
    COLORLESS_BREATH,
    RED_BEAST,
    BLUE_BEAST,
    GREEN_BEAST,
    COLORLESS_BEAST,
    //TODO:- some of these have extra properties that would be nice to attach here??
};
export type WeaponTypeName = keyof typeof WeaponType;
export type WeaponTypeBitfield = { [weaponTypeId in WeaponType]: boolean };

export enum Series {
    HEROES,
    SHADOW_DRAGON_AND_NEW_MYSTERY,
    ECHOES,
    GENEALOGY_OF_THE_HOLY_WAR,
    THRACIA_776,
    BINDING_BLADE,
    BLAZING_BLADE,
    SACRED_STONES,
    PATH_OF_RADIANCE,
    RADIANT_DAWN,
    AWAKENING,
    FATES,
    THREE_HOUSES,
    TOKYO_MIRAGE_SESSIONS,
};
export type SeriesName = keyof typeof Series;
export type SeriesBitfield = { [seriesId in Series]: boolean };

export interface SkillDefinition {
    idNum: number
    sortId: number,

    idTag: string,
    nameId: string,
    descId: string,

    prerequisites: string[],
    nextSkill: string | null,

    exclusive: boolean,
    enemyOnly: boolean,

    category: SkillCategory,
    wepEquip: WeaponTypeBitfield,
    movEquip: MovementTypeBitfield,
}

export interface WeaponDefinition extends SkillDefinition {
    might: number,
    range: number,
    refined: boolean,
    refineBase: string | null,
    refineStats: ParameterPerStat,
    refines: string[],
    arcaneWeapon: boolean,
    category: SkillCategory.WEAPON, // always known
}
// not a complete guard, shifts responsibility to programmer to remember to actually define fields
export function assertIsWeaponDefinition(skillDefinition: SkillDefinition): skillDefinition is WeaponDefinition {
    return skillDefinition.category === SkillCategory.WEAPON;
}

export interface AssistDefinition extends SkillDefinition{
    range: number, // do we need this?
    category: SkillCategory.ASSIST,
}
export function assertIsAssistDefinition(skillDefinition: SkillDefinition): skillDefinition is AssistDefinition {
    return skillDefinition.category === SkillCategory.ASSIST;
}

export interface SpecialDefinition extends SkillDefinition{
    cooldownCount: number,
    category: SkillCategory.SPECIAL,
}
export function assertIsSpecialDefinition(skillDefinition: SkillDefinition): skillDefinition is SpecialDefinition {
    return skillDefinition.category === SkillCategory.SPECIAL;
}

export interface PassiveSkillDefinition extends SkillDefinition{
    imageUrl: string,
}
const passiveSkillCategories : readonly SkillCategory[] = [SkillCategory.PASSIVE_A, SkillCategory.PASSIVE_B, SkillCategory.PASSIVE_C, SkillCategory.PASSIVE_S];
export function assertIsPassiveSkillDefinition(skillDefinition: SkillDefinition): skillDefinition is PassiveSkillDefinition {
    return passiveSkillCategories.includes(skillDefinition.category);
}

type SkillsPerRarity = [
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
]; // 14 length
export type ParameterPerStat = { [stat in Stat]: number }

export enum OptionalStat {
    HP = "hp",
    ATK = "atk",
    SPD = "spd",
    DEF = "def",
    RES = "res",
    NONE = "none",
}
export enum Stat {
    HP = "hp",
    ATK = "atk",
    SPD = "spd",
    DEF = "def",
    RES = "res"
};

export interface HeroDefinition {
    idNum: number,
    sortValue: number,

    idTag: string,
    nameId: string,
    epithetId: string,

    dragonflowers: { maxCount: number },

    origins: SeriesBitfield,
    series: Series,
    weaponType: WeaponType,
    movementType: MovementType,
    refresher: boolean,

    baseVectorId: number,
    baseStats: ParameterPerStat,
    growthRates: ParameterPerStat,

    // importantly, heroes can equip Skills that are (not exclusive) OR (appear in this collection)
    skills: [SkillsPerRarity, SkillsPerRarity, SkillsPerRarity, SkillsPerRarity, SkillsPerRarity],

    imageUrl: string;
}


export enum Language {
    EUDE, EUEN, EUES, EUFR, EUIT, JPJA, TWZH, USEN, USES, USPT
};
export enum OptionalLanguage {
    EUDE, EUEN, EUES, EUFR, EUIT, JPJA, TWZH, USEN, USES, USPT, NONE
};

export type Message = {
    idTag: string,
    value: string,
};

export type GrowthVectors = string[];