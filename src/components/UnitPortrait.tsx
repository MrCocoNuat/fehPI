import { useQuery } from "@apollo/client"
import loadConfig from "next/dist/server/config"
import { MouseEventHandler, useEffect } from "react";
import { Team, Combatant } from "../engine/types";
import { GET_SINGLE_HERO } from "./api"
import Image from "next/image";

const sizeCss = "w-[50px] sm:w-[80px] md:w-[100px] lg:w-[120px] xl:w-[150px] 2xl:w-[100px] aspect-square";
const sizeNextStr = "(max-width )"

export function UnitPortrait(
    props : {
        combatant?: Combatant,
        clickHandler?: MouseEventHandler,
        mouseEnterHandler?: MouseEventHandler,
        mouseLeaveHandler?: MouseEventHandler,
    }) {
    return (props.combatant) ?
        <Portrait combatant={props.combatant} {...props} />
        : <BlankPortrait {...props}/>;
}


//TODO:- should this handle team background? probably not
function Portrait(
    {
        combatant,
        clickHandler,
        mouseEnterHandler,
        mouseLeaveHandler
    }: {
        combatant: Combatant,
        clickHandler?: MouseEventHandler,
        mouseEnterHandler?: MouseEventHandler,
        mouseLeaveHandler?: MouseEventHandler,
    }) {

    const { loading, error, data } = useQuery(GET_SINGLE_HERO, { variables: { idNum: combatant.unit.idNum} });

    if (loading) return <div className={`${sizeCss} border-blue-900 border-2`}
        onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>...</div>
    if (error) {
        console.error(error);
        return <p className={sizeCss}> error </p>;
    }

    let imageUrl;
    try{
        imageUrl = data.heroes[0].imageUrl;
    } catch {
        console.error(`null imageurl for ${combatant.unit.idNum}`);
        console.error(`api reply: ${JSON.stringify(data)}`);
        imageUrl = "";
    }

    const teamBackgroundColorCss = (combatant.team === Team.PLAYER) ? "bg-blue-300" : "bg-red-300";
    // here just fake some tapped data
    const tappedImageCss = (Math.random() > 0.8) ? "grayscale" : "";
    return <div className={`border-blue-900 border-2 text-center ${teamBackgroundColorCss} ${sizeCss} relative`}
        onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
        <Image className={`${tappedImageCss}`} src={imageUrl} alt={`${Team[combatant.team][0]} - ${data.heroes[0].idTag}`} fill={true} />
    </div>
}

export function BlankPortrait(
    {
        clickHandler,
        mouseEnterHandler,
        mouseLeaveHandler
    }: {
        clickHandler?: MouseEventHandler,
        mouseEnterHandler?: MouseEventHandler,
        mouseLeaveHandler?: MouseEventHandler,
    }
) {

    return <div className={`border-blue-900 border-2 text-center ${sizeCss}`}
        onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
        No unit
    </div>

}