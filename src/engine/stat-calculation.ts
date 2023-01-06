// takes a Unit and returns its stat tuple

import { useQuery } from "@apollo/client";
import { GET_GROWTH_VECTORS, GET_SINGLE_HERO } from "../components/api";
import { GrowthVectors, ParameterPerStat, Stat } from "../pages/api/dao/types/dao-types";
import { Rarity, Unit } from "./types";

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

/*
 traits add or subtract 5 from growth rates.
 Asset and Ascension are not allowed to stack.
*/
function traitAdjustedGrowths({ asset, flaw, ascension }: { asset: Stat | null, flaw: Stat | null, ascension: Stat | null }, growthRates: ParameterPerStat) {
    const copy = { ...growthRates };
    if (flaw !== null) copy[flaw] -= 5;
    if (asset !== null) copy[asset] += 5;
    if (ascension !== asset && ascension !== null) copy[ascension] += 5;
    return copy;
}

/*
 growths are multiplied by a constant depending on rarity
 */
function rarityAdjustedGrowths(rarity: Rarity, growthRates: ParameterPerStat) {
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
 AFTER rarity correction, traits add or subtract 1 from base stats.
 Asset and Ascension are not allowed to stack.
*/
function traitAdjustedBases({ asset, flaw, ascension }: { asset: Stat | null, flaw: Stat | null, ascension: Stat | null }, baseStats: ParameterPerStat) {
    const copy = { ...baseStats };
    if (flaw !== null) copy[flaw]--;
    if (asset !== null) copy[asset]++;
    if (ascension !== asset && ascension !== null) copy[ascension]++;
    return copy;
}

/*
 Starting from 1 star base stats,
 when increasing to 2 or 4 stars, raise the 2 highest that are not HP
 when increasing to 3 or 5 stars, raise HP and the remaining 2 
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
    const nonHpStats: Stat[] = [Stat.ATK, Stat.SPD, Stat.DEF, Stat.RES];
    // in place is good, sort descending
    nonHpStats.sort((statA, statB) => (baseStats3Stars[statB] - baseStats3Stars[statA]));
    const copy = { ...baseStats3Stars };
    switch (rarity) {
        case Rarity.FOUR_STARS:
            nonHpStats.slice(0, 2).forEach(stat => copy[stat]++);
            return copy;
        case Rarity.TWO_STARS:
            copy[Stat.HP]--;
            nonHpStats.slice(2).forEach(stat => copy[stat]--);
            return copy;
    }
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
    const statSpecificOffsets = { [Stat.HP]: -35 + 64, [Stat.ATK]: -28 + 64, [Stat.SPD]: -21 + 64, [Stat.DEF]: -14 + 64, [Stat.RES]: -7 + 64 } as const;
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

    const adjustedGrowthRates = rarityAdjustedGrowths(unit.rarity, traitAdjustedGrowths(unit, hero.growthRates));

    const growths: ParameterPerStat = { hp: 0, atk: 0, spd: 0, def: 0, res: 0 };
    for (const s in growths) {
        const stat = s as Stat;
        growths[stat] = growthFor(stat, unit, { baseStat: hero.baseStats[stat], adjustedGrowthRate: adjustedGrowthRates[stat], baseVectorId: hero.baseVectorId }, growthVectors);
    }

    return growths;
}

function basesFor(unit: Unit,
    { baseStats: baseStats3Stars }:
        { baseStats: ParameterPerStat }
) {
    return traitAdjustedBases(unit, rarityAdjustedBases(unit.rarity, baseStats3Stars));
}

export function statsFor(unit: Unit): ParameterPerStat | string {
    const { loading: gvLoading, error: gvError, data: gvData } = useQuery(GET_GROWTH_VECTORS);
    const { loading: hLoading, error: hError, data: hData } = useQuery(GET_SINGLE_HERO, { variables: { idNum: unit.idNum } })

    if (gvLoading || hLoading) return "Loading...";
    if (gvError || hError) return "error";

    const hero = hData.heroes[0];

    const growths = growthsFor(unit, hero, gvData.growthVectors as GrowthVectors[]);
    const bases = basesFor(unit, hero);

    console.log(`bases: ${JSON.stringify(bases)}`);
    console.log(`growths: ${JSON.stringify(growths)}`);
    // missing steps
    // DF
    // merges

    // resplendent, sumsupport, blessings, bonusunit are not dependent on the unit and so considered to be +stat skills

    // add bases and growths
    const stats = {
        hp: bases.hp + growths.hp,
        atk: bases.atk + growths.atk,
        spd: bases.spd + growths.spd,
        def: bases.def + growths.def,
        res: bases.res + growths.res,
    };

    return stats;
}