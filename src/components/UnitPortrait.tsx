import { gql, useQuery } from "@apollo/client"
import loadConfig from "next/dist/server/config"
import { MouseEventHandler, useEffect } from "react";
import { Team, Combatant } from "../engine/types";
import Image from "next/image";
import { HERO_IMAGE_URL, HERO_IMAGE_URL_FRAG, HERO_MOVEMENT_WEAPON, HERO_MOVEMENT_WEAPON_FRAG, INCLUDE_FRAG } from "./api-fragments";
import { MovementType, WeaponType } from "../pages/api/dao/types/dao-types";

// Query
// ----------

const GET_SINGLE_HERO = gql`
    ${HERO_IMAGE_URL_FRAG}
    ${HERO_MOVEMENT_WEAPON_FRAG}
    query getHeroImageUrl($id: Int!){
        heroes(idNums: [$id]){
            idNum
            idTag
            ${INCLUDE_FRAG(HERO_IMAGE_URL)}
            ${INCLUDE_FRAG(HERO_MOVEMENT_WEAPON)}
    }
}
`;

type HeroPortraitDetails = {
    idNum: number,
    idTag: string,
    imageUrl: string,
    resplendentImageUrl: string | null,
    movementType: MovementType,
    weaponType: WeaponType,
}

const mapQuery = (json: any) => json.heroes.map((queriedHero: any) => ({
    ...queriedHero,
    movementType: MovementType[queriedHero.movementType],
    weaponType: WeaponType[queriedHero.weaponType],
}))[0] as HeroPortraitDetails;



const sizeCss = "w-[50px] sm:w-[80px] md:w-[100px] lg:w-[120px] xl:w-[150px] 2xl:w-[100px] aspect-square";
const sizeNextStr = "(max-width )"

export function UnitPortrait(
    props: {
        combatant?: Combatant,
        clickHandler?: MouseEventHandler,
        mouseEnterHandler?: MouseEventHandler,
        mouseLeaveHandler?: MouseEventHandler,
    }) {
    return (props.combatant) ?
        <Portrait combatant={props.combatant} {...props} />
        : <BlankPortrait {...props} />;
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

    const { loading, error, data } = useQuery(GET_SINGLE_HERO, { variables: { id: combatant.unit.idNum } });

    if (loading) return <div className={`${sizeCss} border-blue-900 border-2`}
        onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>...</div>
    if (error) {
        console.error(error);
        return <p className={sizeCss}> error </p>;
    }

    const altText = `${Team[combatant.team][0]} - ${data.heroes[0].idTag}`;
    const queryResults = mapQuery(data);
    const srcUrl = (combatant.unit.resplendent) ?
        queryResults.resplendentImageUrl ?? queryResults.imageUrl :
        queryResults.imageUrl;
    console.log(data);
    console.log(queryResults);
    console.log("image src is", srcUrl)

    const teamBackgroundColorCss = (combatant.team === Team.PLAYER) ? "bg-blue-300" : "bg-red-300";
    // here just fake some tapped data
    const tappedImageCss = (Math.random() > 0.8) ? "grayscale" : "";
    return <div className={`border-blue-900 border-2 text-center ${teamBackgroundColorCss} ${sizeCss} relative`}
        onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
        <Image className={`${tappedImageCss}`} src={srcUrl} alt={altText} fill={true} />
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