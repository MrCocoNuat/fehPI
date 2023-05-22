import { Unica_One } from "@next/font/google";
import { BlessingSeason, OptionalStat, ParameterPerStat, Stat } from "../pages/api/dao/types/dao-types"
import { statsFor, sumUp } from "./stat-calculation";
import { v4 as uuidv4 } from 'uuid';

export function constrainNumeric(value: number, min: number, max: number) {
    return (value > min) ? ((value < max) ? value : max) : min;
}

export enum Affiliation {
    PLAYER, ENEMY,
}

export enum Terrain {
    NORMAL,
    TRENCH, // Costs cavalry 3 movement to enter
    DEFENSIVE, // %DR
    DEF_TRENCH, // both
    UNBREAKABLE, // no one can enter
    CRACK_ONCE, // same, 2 hits break it
    CRACK_TWICE,  // same, 1 hit breaks it 
    MOUNTAIN, // only flier can enter
    FOREST, // cavalry cannot enter, costs infantry 2 movement to enter
    DEF_FOREST, // both
    WATER, // really redundant with mountain, both admit only fliers... but it looks different enough that it would be weird to exclude
}

export enum Rarity {
    ONE_STAR,
    TWO_STARS,
    THREE_STARS,
    FOUR_STARS,
    FIVE_STARS,
}
export const { MIN_RARITY, MAX_RARITY } = { MIN_RARITY: Rarity.ONE_STAR, MAX_RARITY: Rarity.FIVE_STARS };

// 0 is explicitly no skill - don't use null!
export const NONE_SKILL_ID = 0;
type NONE_SKILL = typeof NONE_SKILL_ID;

// 0 is explicitly no blessing
export const NONE_BLESSING = 0;

export enum SupportLevel {
    NONE,
    C_SUPPORT,
    B_SUPPORT,
    A_SUPPORT,
    S_SUPPORT,
}

export type Unit = {
    uuid: String,

    idNum: number, // of the Hero that this unit is a copy of!
    rarity: Rarity,
    level: number,
    merges: number,
    dragonflowers: number,

    asset: OptionalStat,
    flaw: OptionalStat,
    ascension: OptionalStat,

    weaponSkillId: number | NONE_SKILL,
    // the refine base
    weaponSkillBaseId: number | NONE_SKILL,
    assistSkillId: number | NONE_SKILL,
    specialSkillId: number | NONE_SKILL,
    passiveASkillId: number | NONE_SKILL,
    passiveBSkillId: number | NONE_SKILL,
    passiveCSkillId: number | NONE_SKILL,
    passiveSSkillId: number | NONE_SKILL,

    // blessing - only applicable to non-blessed heroes
    conferredBlessing: BlessingSeason | typeof NONE_BLESSING,

    //support
    summonerSupport: SupportLevel,

    bonusHero: boolean,
    resplendent: boolean,
}
export const { MIN_LEVEL, MAX_LEVEL } = { MIN_LEVEL: 1, MAX_LEVEL: 40 } as const;
export const { MIN_MERGES, MAX_MERGES } = { MIN_MERGES: 0, MAX_MERGES: 10 } as const;
// max dragonflowers is dependent on the unit, but is always at least 5
export const { MIN_DRAGONFLOWERS, MAX_SAFE_DRAGONFLOWERS } = { MIN_DRAGONFLOWERS: 0, MAX_SAFE_DRAGONFLOWERS: 5 } as const;


// Units are instantiations of Heroes (i.e. a Team can have 4 different Anna: Commander, each is a distinct Unit)
export const initUnit: () => Unit = () => ({
    uuid: uuidv4(),

    idNum: 1,
    rarity: Rarity.FIVE_STARS,
    level: 40,
    merges: 0,
    dragonflowers: 0,

    asset: OptionalStat.NONE,
    flaw: OptionalStat.NONE,
    ascension: OptionalStat.NONE,

    weaponSkillId: NONE_SKILL_ID,
    // the refine base
    weaponSkillBaseId: NONE_SKILL_ID,
    assistSkillId: NONE_SKILL_ID,
    specialSkillId: NONE_SKILL_ID,
    passiveASkillId: NONE_SKILL_ID,
    passiveBSkillId: NONE_SKILL_ID,
    passiveCSkillId: NONE_SKILL_ID,
    passiveSSkillId: NONE_SKILL_ID,

    // blessing - only applicable to non-blessed heroes
    conferredBlessing: NONE_BLESSING,

    //support
    summonerSupport: SupportLevel.NONE,

    bonusHero: false,
    resplendent: false,
})

// Once in battle, a Combatant is constructed from each Unit. Combatants have properties that matter only in battle, like tileNumber for map placement etc.
export type Combatant = {
    unit: Unit,
    tileNumber?: number,

    // this should be shown during creation, but not included here until in combat? on Commit
    calculatedStats: ParameterPerStat,
    // These belong only in battle
    tapped: boolean,
    currentHp: number,
}

export const toCombatant: (unit: Unit) => Promise<Combatant> = async (unit) => {
    const calculatedStats = sumUp(await statsFor(unit));
    return {
        unit: unit,
        tapped: false,
        calculatedStats: calculatedStats,
        currentHp: calculatedStats.hp,
    }
}

// symmetric, 2 hero ids
// Importantly, unlike Summoner Support that is Unit-scoped,
// Ally Support is Hero-scoped! (i.e. all copies of Anna: Commander in an Army share an ally support)
export type AllySupportPair = [number, number];

export type Team = {
    units: Unit[],
    allySupports: AllySupportPair[],
}
export const emptyTeam: () => Team = () => ({ units: [], allySupports: [] });
export type Teams = { [affiliation in Affiliation]: Team };

export type BattleTile = {
    terrain: Terrain,
}

export type Army = {
    combatants: Combatant[],
    allySupports: AllySupportPair[],
}
export const toArmy: (team : Team) => Promise<Army> = async (team) => ({
    combatants: await Promise.all(team.units.map(async unit => toCombatant(unit))),
    allySupports: team.allySupports,
})

export type BattleMap = BattleTile[]

export type BattleContext = {
    teams: {
        [affiliation in Affiliation]: Team
    },
    battleMap: BattleMap,
}