import { Stat } from "../pages/api/dao/types/dao-types";
import { BattleMap, BattleTile, Combatant, CombatantTeam, Team, Unit } from "./types";

const randInt = (n: number) => Math.floor(n * Math.random());


export const getRandomTeam: () => Team = () => randInt(2);

export const getRandomUnit: () => Unit = () => ({
    idNum: randInt(800),
    rarity: randInt(5),
    level: randInt(40),
    merges: randInt(11),
    dragonflowers: randInt(6),
    baseVectorId: randInt(64),
    
    asset: null,
    flaw: null,
    ascension: null,
});

export const getRandomCombatant: () => Combatant = () => ({
    team: getRandomTeam(),
    unit: getRandomUnit(),
    tileNumber: -1,
});

export const getRandomCombatantTeam: (forceTeam?: Team) => CombatantTeam = (forceTeam) =>
    new Array(7).fill(0).map(_ => getRandomCombatant()).map(combatant => { combatant.team = forceTeam ?? combatant.team; return combatant; })


export const getRandomBattleTile: () => BattleTile = () => ({
    terrain: randInt(11),
    combatant: (Math.random() > 0.8) ? getRandomCombatant() : undefined,
})

export const getRandomBattleMap: () => BattleMap = () => new Array(48).fill(0).map(_ => getRandomBattleTile());
