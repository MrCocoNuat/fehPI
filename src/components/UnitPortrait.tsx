import { useQuery } from "@apollo/client"
import loadConfig from "next/dist/server/config"
import { useEffect } from "react";
import { GET_HERO } from "./api"

export enum Team {
    PLAYER, ENEMY
}

export type Unit = { idNum: number, team: Team } // barebones

export function UnitPortrait({ unit }: { unit: Unit}) { 
    // tapped heroes get a grayscale portrait, dead ones are darker (and only appear in the team, not the map obviously)
    const {loading, error, data} = useQuery(GET_HERO, {variables: {idNum: unit.idNum}});
    
    if (loading) return <p>...</p>
    if (error) {
        console.error(error);
        return <></>;
    }
    
    const {imageUrl} = data.heroes[0];
    const teamBackgroundColorCss = (unit.team === Team.PLAYER)? "bg-blue-300" : "bg-red-300";
    // here just fake some tapped data
    const tappedImageCss = (Math.random() > 0.8)? "grayscale -z-10" : "";
    return <div className={`border-blue-900 border-2 text-center ${teamBackgroundColorCss} aspect-square`}>
        <img className={`${tappedImageCss}`} src={imageUrl} alt={`${Team[unit.team][0]} - ${data.heroes[0].idTag}`}/>
    </div>
}