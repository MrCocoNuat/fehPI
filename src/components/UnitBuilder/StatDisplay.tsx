// one row for each

import { gql, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { statsFor } from "../../engine/stat-calculation";
import { Unit } from "../../engine/types";
import { ParameterPerStat } from "../../pages/api/dao/types/dao-types";
import { HERO_STATS, HERO_STATS_FRAG, INCLUDE_FRAG } from "../api-fragments";

// Query 
// ----------

const GET_GROWTH_VECTORS = gql`
query getGrowthVectors{
    growthVectors
} `;

const GET_SINGLE_HERO = gql`
    ${HERO_STATS_FRAG}
    query getHero($id: Int!){
        heroes(idNums: [$id]){
            idNum
            ${INCLUDE_FRAG(HERO_STATS)}
        }
    }
`;


export enum StatSource {
    BASE,
    GROWTH,
    MERGE,
    DRAGONFLOWER,
    RESPLENDENT,
    BONUS_HERO,
    BLESSING,
    SKILLS,
}

const StatSourceResourceIds = {
    [StatSource.BASE]: "STAT_SOURCE_BASE",
    [StatSource.GROWTH]: "STAT_SOURCE_GROWTH",
    [StatSource.MERGE]: "STAT_SOURCE_MERGE",
    [StatSource.DRAGONFLOWER]: "UNIT_DRAGONFLOWERS",
    [StatSource.RESPLENDENT]: "UNIT_RESPLENDENT",
    [StatSource.BONUS_HERO]: "UNIT_BONUS",
    [StatSource.BLESSING]: "UNIT_BLESSING",
    [StatSource.SKILLS]: "STAT_SOURCE_SKILL",
} as const;

export type StatsPerSource = { [statSource in StatSource]: ParameterPerStat };



export function StatDisplay({
    currentUnit,
    // read only wrt given unit
}: {
    currentUnit: Unit,
}) {
    const [growthVectorQuery] = useLazyQuery(GET_GROWTH_VECTORS);
    const [heroStatsQuery] = useLazyQuery(GET_SINGLE_HERO, { variables: { id: currentUnit.idNum } })

    const [stats, setStats] = useState(undefined as StatsPerSource | undefined);

    useEffect(() => {
        const update = async () => {
            const stats = await statsFor(currentUnit, heroStatsQuery().then(query => query.data), growthVectorQuery().then(query => query.data));
            setStats(stats);
        }
        update();
    },
        // oh boy, currentUnit: nearly every change to it will change stats. Good that mergeChanges creates a new object
        [currentUnit]);

    // if state is undefined, just show ... everywhere
    return <>{JSON.stringify(stats)}</>
}