import { MouseEventHandler } from "react";
import { Combatant, Terrain } from "../engine/types";
import { FocusType } from "./BattlePane";
import { UnitPortrait } from "./UnitPortrait";




export function BattleTileComponent(
    {
        battleUnit,
        terrain,
        clickHandlerWith,
        mouseEnterHandler,
        mouseLeaveHandler
    }: {
        battleUnit?: Combatant,
        terrain: Terrain,
        // allows distinction between the tile itself or the unit on it
        clickHandlerWith?: (focusType: FocusType) => MouseEventHandler,
        mouseEnterHandler?: MouseEventHandler,
        mouseLeaveHandler?: MouseEventHandler
    }) {

    const [tileClickHandler, portraitClickHandler] = clickHandlerWith ?
        [clickHandlerWith(FocusType.TILE), clickHandlerWith(FocusType.TILE_UNIT)]
        : [undefined, undefined];

    return <div className="border-red-900 border-2 text-xs"
        onClick={tileClickHandler}>
        <UnitPortrait unit={battleUnit} clickHandler={portraitClickHandler} mouseEnterHandler={mouseEnterHandler} mouseLeaveHandler={mouseLeaveHandler}></UnitPortrait>
        {Terrain[terrain]}
    </div>
}