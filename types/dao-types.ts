// These are objects, not arrays, because keyof only works on object types

// Thanks, https://stackoverflow.com/a/59723513
export function objForEach<T>(obj: T, f: (k: keyof T, v: T[keyof T]) => void): void {
    for (let k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            f(k, obj[k]);
        }
    }
}

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
export type MovementTypeIdBitfield = {[movementTypeId in MovementType] : boolean};

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
    //TODO- some of these have extra properties that would be nice to attach here??
};
export type WeaponTypeName = keyof typeof WeaponType;
export type WeaponTypeIdBitfield = {[weaponTypeId in WeaponType] : boolean};

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
export type SeriesIdBitfield = {[seriesId in Series] : boolean};


export interface IdNumIndexed {
    idNum: number
}

export type SkillDefinition = IdNumIndexed & {
    sortId: number,
    
    idTag : string,
    nameId : string,
    descId: string,
    
    prerequisites : [string | null, string | null],
    refineBase : string | null,
    nextSkill : string | null,
    
    exclusive : boolean,
    enemyOnly : boolean,
    arcaneWeapon : boolean,
    
    category : SkillCategory,
    wepEquip: WeaponTypeIdBitfield,
    movEquip: MovementTypeIdBitfield,
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
export type ParameterPerStat = {
    hp: number,
    atk: number,
    spd: number,
    def: number,
    res: number
}

export type HeroDefinition = IdNumIndexed & {
    sortValue: number,
    
    idTag: string,
    
    dragonflowers : {maxCount: number},
    
    origins: SeriesIdBitfield,
    series: Series,
    weaponType: WeaponType,
    moveType: MovementType,
    refresher: boolean,
    
    baseVectorId: number,
    baseStats: ParameterPerStat,
    growthRates: ParameterPerStat,
    
    // importantly, heroes can equip Skills that are (not exclusive) OR (appear in this collection)
    skills: [SkillsPerRarity, SkillsPerRarity, SkillsPerRarity, SkillsPerRarity, SkillsPerRarity];
}