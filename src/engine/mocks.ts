import { Nunito } from "@next/font/google";
import { OptionalStat, Stat } from "../pages/api/dao/types/dao-types";
import { statsFor } from "./stat-calculation";
import { BattleMap, BattleTile, Combatant, Army, NONE_BLESSING, SupportLevel, Affiliation, Unit } from "./types";

const NUM_TILES = 48;
const NUM_TEAM_MEMBERS = 7;
const NUM_TEAMS = 2;

const randInt = (n: number) => Math.floor(n * Math.random());

const randomTraits: () => { asset: OptionalStat, flaw: OptionalStat, ascension: OptionalStat } = () => {
    const traits = { asset: OptionalStat.NONE, flaw: OptionalStat.NONE, ascension: OptionalStat.NONE };

    const allStats = [Stat.HP, Stat.ATK, Stat.SPD, Stat.DEF, Stat.RES];
    const threeRandomStats = []; // without replacement!!
    for (let i = 0; i < 3; i++) {
        const choice = randInt(allStats.length);
        const stat = allStats.splice(choice, 1)[0];
        threeRandomStats.push(stat);
    }
    if (Math.random() < 20 / 21) {
        // not neutral
        traits.asset = threeRandomStats[0] as unknown as OptionalStat;
        traits.flaw = threeRandomStats[1] as unknown as OptionalStat;
    }

    if (Math.random() < 0.5) {
        // give an ascension
        traits.ascension = threeRandomStats[2] as unknown as OptionalStat;
    }
    return traits;
}


const randomUnit: () => Unit = () => ({
    idNum: 1 + randInt(893),
    rarity: randInt(5),
    level: 40, //randInt(40), // level adjustments are so poorly supported by others...
    merges: randInt(11),
    dragonflowers: randInt(6),
    baseVectorId: randInt(64),

    ...randomTraits(),

    // leave skills empty
    weaponSkillId: 0,
    weaponSkillBaseId: 0,
    assistSkillId: 0,
    specialSkillId: 0,
    passiveASkillId: 0,
    passiveBSkillId: 0,
    passiveCSkillId: 0,
    passiveSSkillId: 0,

    conferredBlessing: NONE_BLESSING,
    summonerSupport: SupportLevel.NONE,
    resplendent: false,
    bonusHero: false,
});

const randomCombatant: (team: Affiliation, teamNumber: number, tileNumber: number) => Combatant = (team, teamNumber, tileNumber) => {
    throw Error("attempted invocation of deprecated randomCombatant (toKillId 715870286)");
    return ({
    team: team,
    unit: randomUnit(),
    tileNumber: tileNumber,
    teamNumber: teamNumber,

    tapped: false,
    calculatedStats: {hp:-99,atk:-99,spd:-99,def:-99,res:-99}, // temp
    currentHp: 999,
});

export const generateTeams: () => { [affiliation in Affiliation]: Army } = () => {
    // assign the team members randomly to tiles
    const fourteenTileNumbers: number[] = [];
    const pool = new Array(NUM_TILES).fill(0).map((_, i) => i);
    for (let i = 0; i < NUM_TEAMS * NUM_TEAM_MEMBERS; i++) {
        const choice = pool.splice(randInt(pool.length), 1)[0];
        fourteenTileNumbers.push(choice);
    }

    return {
        [Affiliation.PLAYER]: {
            combatants: new Array(NUM_TEAM_MEMBERS).fill(0).map((_, i) => randomCombatant(Affiliation.PLAYER, i, fourteenTileNumbers[i])),
            allySupports: [],
        },
        [Affiliation.ENEMY]: {
            combatants: new Array(NUM_TEAM_MEMBERS).fill(0).map((_, i) => randomCombatant(Affiliation.ENEMY, i, fourteenTileNumbers[i + NUM_TEAM_MEMBERS])),
            allySupports: [],
        }
    }
}


const generateBattleTile: () => BattleTile = () => ({
    terrain: randInt(11),
})

export const generateBattleMap: () => BattleMap = () => {
    return Array(48).fill(0).map((_, i) => generateBattleTile());
};
