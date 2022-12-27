
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
};
export type SkillCategory = keyof typeof skillCategories;

export const movTypes = {
    infantry : 0,
    armored : 1,
    cavalry : 2,
    flier : 3
};
export type MovTypes = keyof typeof movTypes;

export const wepTypes = {
    sword: 0,

};
export type WepType = keyof typeof wepTypes;

export type SkillDefinition = {
    idNum: number,
    sortId: number,
    
    idTag : string,
    nameId : string,
    descId: string,
    
    prerequisites : [string | null, string | null],
    refineBase : string | null,
    nextSkill : string,
    
    exclusive : boolean,
    enemyOnly : boolean,
    arcaneWeapon : boolean,
    
    category : number,
    wepEquip: number,
    movEquip: number,
}
