export const skillCategories = {
    weapon : 0,
    assist : 1,
    special : 2, 
    a : 3, 
    b : 4, 
    c : 5, 
    s : 6, 
    refine_effect : 7, 
    beast_effect : 8,
} as const;
export type SkillCategory = keyof typeof skillCategories;
export type SkillCategoryId = typeof skillCategories[keyof typeof skillCategories];

export const movTypes = {
    infantry : 0,
    armored : 1,
    cavalry : 2,
    flier : 3
} as const;
export type MovType = keyof typeof movTypes;
export type MovTypeId = typeof movTypes[keyof typeof movTypes];

export const wepTypes = {
    sword: 0,
    lance: 1,
    axe: 2,
    red_bow: 3,
    blue_bow: 4,
    green_bow: 5,
    colorless_bow: 6,
    red_dagger: 7,
    blue_dagger: 8,
    green_dagger: 9,
    colorless_dagger: 10,
    red_tome: 11,
    blue_tome: 12,
    green_tome: 13,
    colorless_tome: 14,
    staff: 15,
    red_breath: 16,
    blue_breath: 17,
    green_breath: 18,
    colorless_breath: 19,
    red_beast: 20,
    blue_beast: 21,
    green_beast: 22,
    colorless_beast: 23
    //TODO- some of these have extra properties that would be nice to attach here??
} as const;
export type WepType = keyof typeof wepTypes;
export type WepTypeId = typeof wepTypes[keyof typeof wepTypes];

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
    
    category : number,
    wepEquip: number,
    movEquip: number, //TODO- should be maps from wep/move types to booleans? bitfield
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
    "hp": number,
    "atk": number,
    "spd": number,
    "def": number,
    "res": number
}

export type HeroDefinition = IdNumIndexed & {
    sortValue: number,
    
    idTag: string,
    
    dragonflowers : {maxCount: number},
    
    origins: number, //bitfield
    series: number,
    weaponType: WepTypeId,
    moveType: MovTypeId,
    refresher: boolean,
    
    baseVectorId: number,
    baseStats: ParameterPerStat,
    growthRates: ParameterPerStat,
    
    // importantly, heroes can equip Skills that are not exclusive OR appear in this collection
    skills: [SkillsPerRarity, SkillsPerRarity, SkillsPerRarity, SkillsPerRarity, SkillsPerRarity];
}