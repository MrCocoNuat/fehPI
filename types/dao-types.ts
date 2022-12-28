// These are objects, not arrays, because keyof only works on object types
export const skillCategories = {
    0: "weapon",
    1: "assist",
    2: "special", 
    3: "a", 
    4: "b", 
    5: "c", 
    6: "s", 
    7: "refine_effect", 
    8: "beast_effect",
} as const;
export type SkillCategory = typeof skillCategories[keyof typeof skillCategories];
export type SkillCategoryId = keyof typeof skillCategories;

export const movTypes = {
    0: "infantry", 
    1: "armored", 
    2: "cavalry", 
    3: "flier"
} as const;
export type MovType = typeof movTypes[keyof typeof movTypes];
export type MovTypeId = keyof typeof movTypes;

export const wepTypes = {
    0: "sword",
    1: "lance",
    2: "axe",
    3: "red_bow",
    4: "blue_bow",
    5: "green_bow",
    6: "colorless_bow",
    7: "red_dagger",
    8: "blue_dagger",
    9: "green_dagger",
    10: "colorless_dagger",
    11: "red_tome",
    12: "blue_tome",
    13: "green_tome",
    14: "colorless_tome",
    15: "staff",
    16: "red_breath",
    17: "blue_breath",
    18: "green_breath",
    19: "colorless_breath",
    20: "red_beast",
    21: "blue_beast",
    22: "green_beast",
    23: "colorless_beast"
    //TODO- some of these have extra properties that would be nice to attach here??
} as const;
export type WepType = typeof wepTypes[keyof typeof wepTypes];
export type WepTypeId = keyof typeof wepTypes;

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