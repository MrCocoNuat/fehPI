// takes a Unit and returns its stat tuple

import { useQuery } from "@apollo/client";
import { GET_GROWTH_VECTORS, GET_SINGLE_HERO } from "../components/api";
import { GrowthVectors, ParameterPerStat } from "../pages/api/dao/types/dao-types";
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
function closeEnoughFloor(x : number){
    return Math.floor(x + x*Number.EPSILON);
}

// prevent negative values from messing up (a % b)
const statSpecificOffsets: ParameterPerStat = { hp: -35 + 64, atk: -28 + 64, spd: -21 + 64, def: -14 + 64, res: -7 + 64 };
const rarityFactor = [-1, 0.86, 0.93, 1, 1.07, 1.14];

/*
 Starting from 1 star base stats,
 when increasing to 2 or 4 stars, raise the 2 highest that are not HP
 when increasing to 3 or 5 stars, raise HP and the remaining 2 
 break ties by atk > spd > def > res.
*/
function rarityAdjusted(rarity: Rarity, baseStats3Stars: ParameterPerStat): ParameterPerStat {
    switch (rarity) {
        case Rarity.THREE_STARS:
            return { ...baseStats3Stars };
    }

    const { hp, atk, spd, def, res } = baseStats3Stars;
    switch (rarity) {
        case Rarity.FIVE_STARS:
            return { hp: hp + 1, atk: atk + 1, spd: spd + 1, def: def + 1, res: res + 1 };
        case Rarity.ONE_STAR:
            return { hp: hp - 1, atk: atk - 1, spd: spd - 1, def: def - 1, res: res - 1 };
    }

    const copy = { ...baseStats3Stars };
    // actually need to sort
    const nonHpStats: (keyof ParameterPerStat)[] = ["atk", "spd", "def", "res"];
    // in place is good, sort descending
    nonHpStats.sort((statA, statB) => (baseStats3Stars[statB] - baseStats3Stars[statA]));
    switch (rarity) {
        case Rarity.FOUR_STARS:
            nonHpStats.slice(0, 2).forEach(stat => copy[stat]++);
            return copy;
        case Rarity.TWO_STARS:
            copy["hp"]--;
            nonHpStats.slice(2).forEach(stat => copy[stat]--);
            return copy;
    }
}

function growthsFor(unit: Unit, {
    growthVectors,
    hero,
}: {
    growthVectors: GrowthVectors[],
    hero: {
        baseStats: ParameterPerStat,
        growthRates: ParameterPerStat
    }
}): ParameterPerStat {
    const { baseStats, growthRates } = hero;

    const growths: ParameterPerStat = { hp: 0, atk: 0, spd: 0, def: 0, res: 0 };
    for (const s in growths) {
        const stat = s as keyof ParameterPerStat;

        //TODO:- is handling the 0% gv 01100000 11001111 10111010 01100001 01110001 or > 100% gvs necessary?

        const growthPoint = closeEnoughFloor(rarityFactor[unit.rarity] * growthRates[stat]); // rarity adjusted growth rate
        const totalGrowth = closeEnoughFloor(39 / 100 * growthPoint);
        
        // very very likely branch, so optimize here:
        if (unit.level === 40){
            growths[stat] = totalGrowth;
            continue;
        }
        
        const gvid = closeEnoughFloor(3 * (baseStats[stat] + 1) + statSpecificOffsets[stat] + growthPoint + unit.baseVectorId) % 64;

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
        growths[stat] = growth;
    }

    return growths;
}

export function statsFor(unit: Unit): ParameterPerStat | string {
    const { loading: gvLoading, error: gvError, data: gvData } = useQuery(GET_GROWTH_VECTORS);
    const { loading: hLoading, error: hError, data: hData } = useQuery(GET_SINGLE_HERO, { variables: { idNum: unit.idNum } })

    if (gvLoading || hLoading) return "Loading...";
    if (gvError || hError) return "error";

    const hero = hData.heroes[0];

    const growths = growthsFor(unit, { growthVectors: gvData.growthVectors as GrowthVectors[], hero });
    const bases = rarityAdjusted(unit.rarity, hero.baseStats);
    console.log(`bases: ${JSON.stringify(bases)}`);
    console.log(`growths: ${JSON.stringify(growths)}`);
    // missing steps
    // DF
    // traits !!!
    // merges

    // resplendent, sumsupport, blessings, bonusunit are not dependent on a unit and considered to be +stat skills


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