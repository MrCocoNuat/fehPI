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
    
    const sizeCss = "w-[50px] sm:w-[80px] md:w-[100px] lg:w-[120px] xl:w-[150px] 2xl:w-[100px] aspect-square";

    if (loading) return <p className={sizeCss}>...</p>
    if (error) {
        console.error(error);
        return <p className={sizeCss}> error </p>;
    }
    
    const {imageUrl} = data.heroes[0];
    const teamBackgroundColorCss = (unit.team === Team.PLAYER)? "bg-blue-300" : "bg-red-300";
    // here just fake some tapped data
    const tappedImageCss = (Math.random() > 0.8)? "grayscale" : "";
    return <div className={`border-blue-900 border-2 text-center ${teamBackgroundColorCss} ${sizeCss}`}>
        <img className={`${tappedImageCss}`} src={imageUrl} alt={`${Team[unit.team][0]} - ${data.heroes[0].idTag}`}/>
    </div>
}