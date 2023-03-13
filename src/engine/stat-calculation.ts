// takes a Unit and returns its stat tuple

import { StatSource, StatsPerSource } from "../components/UnitBuilder/StatDisplay";
import { GrowthVectors, OptionalStat, ParameterPerStat, Stat } from "../pages/api/dao/types/dao-types";
import { Rarity, Unit } from "./types";

// TODO: Adjust stat calculation to remove bad assumptions (growth rate > 100% is possible, hp is always prioritized when merge/dfing)

/*

How to calculate stats of a Unit:

Each Hero has baseStat (at 3*), growthRate (out of 100) for each stat, and a characteristic BaseVectorID. 

For stat calculation, it is actually the 5* base stats that matter - this is always
1 more than the 3* base stat.

--------------------------------------------------

Acquire a table of Growth Vectors - there are (39 sets) of (64 tuples) of (39-bit) vectors:
Each hero gains 1 point of a particular stat on level-up when the bit 

    GV[totalGrowth][GVID][newLevel] 

is set. Note that bitvector[0] is the LSB.

newLevel is the level that the level-up brings the Unit to, in the range 2-40. 
Therefore the least 2 bits of any vector are irrelevant, as they represent level-ups to 0 and 1.

totalGrowth is the Hamming weight of all Growth Vectors in the set. It is how many points 
a Unit will gain from level 1 to 40 using a Growth Vector in that set.

GVID is psuedorandom.

--------------------------------------------------

totalGrowth and GVID are found by these formulae - this is all integer computation so [x] = floor(x):

rarityFactor = 0.79 + 0.07 * stars, is given below

>> totalGrowth = [(40 - 1)/100 * [rarityFactor * growthRate]]

statSpecificOffset is given below

>> GVID = [3(baseStat + 1) + statSpecificOffset + [rarityFactor * growthRate] + BVID] % 64
*/

// I hate having to use floats when integers are just not a thing...
function closeEnoughFloor(x: number) {
    return Math.floor(x + x * Number.EPSILON);
}

const nonHpStats = [Stat.ATK, Stat.SPD, Stat.DEF, Stat.RES] as const;
const allStats = [Stat.HP, Stat.ATK, Stat.SPD, Stat.DEF, Stat.RES] as const;
function orderBaseStatsDescending(whichStats: readonly Stat[], baseValues: ParameterPerStat) {
    const copy = [...whichStats];
    // sort in place
    copy.sort((statA, statB) => (baseValues[statB] - baseValues[statA]));
    return copy;
}

/*
 traits add or subtract 5 from growth rates.
 Asset and Ascension are not allowed to stack.

 if there are merges. do not apply a flaw
*/
function traitAdjustedGrowthRates({ merges, asset, flaw, ascension }: Unit, growthRates: ParameterPerStat) {
    const copy = { ...growthRates };
    if (merges === 0 && flaw !== OptionalStat.NONE) copy[flaw] -= 5;
    if (asset !== OptionalStat.NONE) copy[asset] += 5;
    if (ascension !== asset && ascension !== OptionalStat.NONE) copy[ascension] += 5;
    return copy;
}

/*
 growths are multiplied by a constant depending on rarity
 */
function rarityAdjustedGrowthRates(rarity: Rarity, growthRates: ParameterPerStat) {
    const rarityFactor = {
        [Rarity.ONE_STAR]: 0.86,
        [Rarity.TWO_STARS]: 0.93,
        [Rarity.THREE_STARS]: 1,
        [Rarity.FOUR_STARS]: 1.07,
        [Rarity.FIVE_STARS]: 1.14
    } as const;
    const copy = { ...growthRates };
    for (const s in copy) {
        copy[s as Stat] = closeEnoughFloor(rarityFactor[rarity] * copy[s as Stat]);
    }
    return copy;
}

/*
 For purposes of stat ordering in merges/dragonflowers, ascensions do not count
*/
function traitAdjustedBasesWithoutAscension(unit: Unit, baseStats: ParameterPerStat) {
    return traitAdjustedBases({ ...unit, ascension: OptionalStat.NONE }, baseStats);
}

/*
 AFTER rarity correction, traits add or subtract 1 from base stats.
 Asset and Ascension are not allowed to stack.

 If there are merges, do not apply a flaw
*/
function traitAdjustedBases({ merges, asset, flaw, ascension }: Unit, baseStats: ParameterPerStat) {
    const copy = { ...baseStats };
    if (merges === 0 && flaw !== OptionalStat.NONE) copy[flaw]--;
    if (asset !== OptionalStat.NONE) copy[asset]++;
    if (ascension !== asset && ascension !== OptionalStat.NONE) copy[ascension]++;
    return copy;
}

/*
 Starting from 1 star base stats,
 when increasing to 2 or 4 stars, raise by 1 the 2 highest that are not HP
 when increasing to 3 or 5 stars, raise by 1 HP and the remaining 2 
 break ties by atk > spd > def > res.
*/
function rarityAdjustedBases(rarity: Rarity, baseStats3Stars: ParameterPerStat) {
    // nothing changes
    switch (rarity) {
        case Rarity.THREE_STARS:
            return { ...baseStats3Stars };
    }

    // these are all 1 added or subtracted
    const { hp, atk, spd, def, res } = baseStats3Stars;
    switch (rarity) {
        case Rarity.FIVE_STARS:
            return { hp: hp + 1, atk: atk + 1, spd: spd + 1, def: def + 1, res: res + 1 };
        case Rarity.ONE_STAR:
            return { hp: hp - 1, atk: atk - 1, spd: spd - 1, def: def - 1, res: res - 1 };
    }

    // actually need to sort
    const orderedNonHpStats = orderBaseStatsDescending(nonHpStats, baseStats3Stars);
    const copy = { ...baseStats3Stars };
    switch (rarity) {
        case Rarity.FOUR_STARS:
            orderedNonHpStats.slice(0, 2).forEach(stat => copy[stat]++);
            return copy;
        case Rarity.TWO_STARS:
            copy[OptionalStat.HP]--;
            orderedNonHpStats.slice(2).forEach(stat => copy[stat]--);
            return copy;
    }
}

/*
 If there are merges and no flaw, add 1 to the 3 highest base stats.
 For each merge, add 1 to the next 2 stats, in ordered sequence, wrapping when necessary. 10 merges applies +4 to all stats.
*/
function mergeBonuses(unit: Unit, orderedAllStats: Stat[]) {
    const bonuses: ParameterPerStat = { [OptionalStat.HP]: 0, [OptionalStat.ATK]: 0, [OptionalStat.SPD]: 0, [OptionalStat.DEF]: 0, [OptionalStat.RES]: 0 }
    if (unit.merges !== 0 && unit.flaw === null) {
        orderedAllStats.slice(0, 3).forEach(stat => bonuses[stat]++);
    }

    // optimize here, very common branch
    if (unit.merges === 10) {
        orderedAllStats.forEach(stat => bonuses[stat] += 4);
        return bonuses;
    }

    // otherwise apply manually
    for (let merge = 0, i = 0; merge < unit.merges; merge++) {
        bonuses[orderedAllStats[i++ % 5]]++;
        bonuses[orderedAllStats[i++ % 5]]++;
    }
    return bonuses;
}

/*
  For each dragonflower, add 1 to the next stat, in ordered sequence, wrapping when necessary. Each 5 dragonflowers applies +1 to all stats.
*/
function dragonflowerBonuses({ dragonflowers }: Unit, orderedAllStats: Stat[]) {
    const bonuses: ParameterPerStat = { [OptionalStat.HP]: 0, [OptionalStat.ATK]: 0, [OptionalStat.SPD]: 0, [OptionalStat.DEF]: 0, [OptionalStat.RES]: 0 }

    // optimize here, very common branch
    if (dragonflowers % 5 === 0 && dragonflowers >= 0) {
        orderedAllStats.forEach(stat => bonuses[stat] += dragonflowers / 5);
        return bonuses;
    }

    // otherwise apply manually
    for (let df = 0; df < dragonflowers;) {
        bonuses[orderedAllStats[df++ % 5]]++;
    }
    return bonuses;
}

function growthFor(
    stat: Stat,
    unit: Unit,
    {
        baseStat,
        adjustedGrowthRate,
        baseVectorId,
    }: {
        baseStat: number,
        adjustedGrowthRate: number,
        baseVectorId: number
    },
    growthVectors: GrowthVectors[],
) {
    // easy enough to optimize this branch out too
    if (unit.level === 1) {
        return 0;
    }

    // is handling the 0% gv 01100000 11001111 10111010 01100001 01110001 or > 100% gvs necessary?
    // The minimum growth rate is 25% and maximum is 80%, so no 

    // rarity adjusted growth rate
    const totalGrowth = closeEnoughFloor(39 / 100 * adjustedGrowthRate);

    // very very likely branch, so optimize here:
    if (unit.level === 40) {
        return totalGrowth;
    }
    // prevent negative values from messing up (a % b)
    const statSpecificOffsets = { [OptionalStat.HP]: -35 + 64, [OptionalStat.ATK]: -28 + 64, [OptionalStat.SPD]: -21 + 64, [OptionalStat.DEF]: -14 + 64, [OptionalStat.RES]: -7 + 64 } as const;
    const gvid = closeEnoughFloor(3 * (baseStat + 1) + statSpecificOffsets[stat] + adjustedGrowthRate + baseVectorId) % 64;

    // cast from a string, this is around 39+2 bits so still safe to represent as a double
    // but turn into a bigint because we want bitshifting
    // js is pretty ridiculous not supporting integer types, like come on!
    const growthVector = BigInt(growthVectors[totalGrowth][gvid]);

    // find the hamming weight of the subvector
    let growth = 0;
    const one = BigInt(0x1);
    for (let i = BigInt(2); i <= unit.level; i++) {
        growth += Number((growthVector >> i) & one);
    }
    return growth;
}

function growthsFor(unit: Unit,
    hero: {
        baseStats: ParameterPerStat,
        growthRates: ParameterPerStat,
        baseVectorId: number,
    },
    growthVectors: GrowthVectors[],
) {

    const adjustedGrowthRates = rarityAdjustedGrowthRates(unit.rarity, traitAdjustedGrowthRates(unit, hero.growthRates));

    const growths: ParameterPerStat = { [OptionalStat.HP]: 0, [OptionalStat.ATK]: 0, [OptionalStat.SPD]: 0, [OptionalStat.DEF]: 0, [OptionalStat.RES]: 0 };
    for (const s in growths) {
        const stat = s as Stat;
        growths[stat] = growthFor(stat, unit, { baseStat: hero.baseStats[stat], adjustedGrowthRate: adjustedGrowthRates[stat], baseVectorId: hero.baseVectorId }, growthVectors);
    }

    return growths;
}


// Exports
// ---------

// always the same
const ZERO_STATS = { [OptionalStat.HP]: 0, [OptionalStat.ATK]: 0, [OptionalStat.SPD]: 0, [OptionalStat.DEF]: 0, [OptionalStat.RES]: 0 } as const;
const RESPLENDENT_STATS = { [OptionalStat.HP]: 2, [OptionalStat.ATK]: 2, [OptionalStat.SPD]: 2, [OptionalStat.DEF]: 2, [OptionalStat.RES]: 2 } as const;
const BONUS_HERO_STATS = { [OptionalStat.HP]: 10, [OptionalStat.ATK]: 4, [OptionalStat.SPD]: 4, [OptionalStat.DEF]: 4, [OptionalStat.RES]: 4 } as const;


export async function statsFor(
    unit: Unit,
    heroStatsPromise: Promise<{
        heroes: [{
            baseStats: ParameterPerStat,
            growthRates: ParameterPerStat,
            baseVectorId: number,
        }]
    }>,
    growthVectorsPromise: Promise<{ growthVectors: GrowthVectors[] }>,
): Promise<StatsPerSource> {

    const hero = (await heroStatsPromise).heroes[0];
    const { baseStats: baseStats3Stars } = hero;
    const growthVectors = (await growthVectorsPromise).growthVectors;

    const traitAdjustedOnlyBases = traitAdjustedBasesWithoutAscension(unit, baseStats3Stars);
    const orderedAllStats = orderBaseStatsDescending(allStats, traitAdjustedOnlyBases);

    return {
        [StatSource.BASE]: traitAdjustedBases(unit, rarityAdjustedBases(unit.rarity, baseStats3Stars)),
        [StatSource.GROWTH]: growthsFor(unit, hero, growthVectors),
        [StatSource.MERGE]: mergeBonuses(unit, orderedAllStats),
        [StatSource.DRAGONFLOWER]: dragonflowerBonuses(unit, orderedAllStats),
        [StatSource.RESPLENDENT]: unit.resplendent ? RESPLENDENT_STATS : ZERO_STATS,
        [StatSource.BONUS_HERO]: unit.bonusHero ? BONUS_HERO_STATS : ZERO_STATS,
        [StatSource.BLESSING]: ZERO_STATS, // need team - other branch
        [StatSource.SKILLS]: ZERO_STATS, // need skill engine, at least CONTINUOUS hook
    };
}
