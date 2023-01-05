import { Dispatch, SetStateAction } from "react";
import { BattleMap, Combatant, Terrain } from "../engine/types";
import { Focus, FocusType } from "./BattlePane";
import { BattleTileComponent } from "./BattleTile";


export function BattleMapComponent(
    {
        tiles,
        updateFocus,
        updateHover
    }: {
        tiles: BattleMap,
        updateFocus: Dispatch<SetStateAction<Focus>>,
        updateHover: Dispatch<SetStateAction<Focus>>,
    }) {

    return <div className="grid grid-cols-6">
        {tiles.map((tile, i) =>
            <BattleTileComponent key={i} battleUnit={tile.combatant} terrain={tile.terrain}
                clickHandlerWith={(focusType: FocusType) => (evt) => { evt.stopPropagation(); updateFocus({ focusType: focusType, focusInfo: i }) }}
                mouseEnterHandler={() => updateHover({ focusType: FocusType.TILE_UNIT, focusInfo: i })}
                mouseLeaveHandler={() => updateHover({ focusType: FocusType.NONE, focusInfo: undefined })}
            />)}
    </div>;
}