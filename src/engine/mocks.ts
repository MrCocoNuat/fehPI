import { Stat } from "../pages/api/dao/types/dao-types";
import { BattleMap, BattleTile, Combatant, CombatantTeam, Team, Unit } from "./types";

const randInt = (n: number) => Math.floor(n * Math.random());

export const getRandomStat: () => Stat = () => [Stat.HP, Stat.ATK, Stat.SPD, Stat.DEF, Stat.RES][randInt(5)];
export const getRandomTraits: () => { asset: Stat | null, flaw: Stat | null, ascension: Stat | null } = () => {
    const traits = { asset: null as Stat | null, flaw: null as Stat | null, ascension: null as Stat | null };

    const allStats = [Stat.HP, Stat.ATK, Stat.SPD, Stat.DEF, Stat.RES];
    const threeRandomStats = []; // without replacement!!
    for (let i = 0; i < 3; i++) {
        const choice = randInt(allStats.length);
        const stat = allStats.splice(choice, 1)[0];
        threeRandomStats.push(stat);
    }
    if (Math.random() < 20/21) {
        // not neutral
        traits.asset = threeRandomStats[0];
        traits.flaw = threeRandomStats[1];
    }

    if (Math.random() < 0.5) {
        // give an ascension
        traits.ascension = threeRandomStats[2];
    }
    return traits;
}
export const getRandomTeam: () => Team = () => randInt(2);

export const getRandomUnit: () => Unit = () => ({
    idNum: randInt(800),
    rarity: randInt(5),
    level: 40, //randInt(40), // level adjustments are so poorly supported by others...
    merges: randInt(11),
    dragonflowers: randInt(6),
    baseVectorId: randInt(64),

    ...getRandomTraits(),

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
    combatant: (Math.random() > 0.5) ? getRandomCombatant() : undefined,
})

export const getRandomBattleMap: () => BattleMap = () => new Array(48).fill(0).map(_ => getRandomBattleTile());
