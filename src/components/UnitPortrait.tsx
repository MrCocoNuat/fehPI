import { useQuery } from "@apollo/client"
import loadConfig from "next/dist/server/config"
import { GET_HERO } from "./api"

export enum Team {
    PLAYER, ENEMY
}

export type Unit = { idNum: number, team: Team } // barebones

export function UnitPortrait({ unit }: { unit: Unit }) {
    const {loading, error, data} = useQuery(GET_HERO, {variables: {idNum: unit.idNum}});

    if (loading) return <p>...</p>
    if (error) {
        console.error(error);
        return <></>;
    }
    // yeah, not much of a looker right now...
    return <div className="border-blue-900 border-2 text-center aspect-square">
        {Team[unit.team][0]} - {data.heroes[0].idTag}

    </div>
}