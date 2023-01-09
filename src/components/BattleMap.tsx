import { Dispatch, SetStateAction } from "react";
import { BattleMap, Combatant, Terrain } from "../engine/types";
import { Focus, FocusType } from "./BattlePane";
import { BattleTileComponent } from "./BattleTile";


export function BattleMapComponent(
    {
        tiles,
        allCombatants,
        updateFocus,
        updateHover
    }: {
        tiles: BattleMap,
        allCombatants : Combatant[],
        updateFocus: Dispatch<SetStateAction<Focus>>,
        updateHover: Dispatch<SetStateAction<Focus>>,
    }) {

    return <div className="grid grid-cols-6">
        {tiles.map((tile, i) =>
            <BattleTileComponent key={i} battleUnit={allCombatants.some(combatant => combatant.tileNumber === i)? allCombatants.filter(combatant => combatant.tileNumber === i)[0]: undefined} terrain={tile.terrain}
                clickHandlerWith={(focusType: FocusType) => (evt) => { evt.stopPropagation(); updateFocus({ focusType: focusType, focusInfo: i }) }}
                mouseEnterHandler={() => updateHover({ focusType: FocusType.TILE_UNIT, focusInfo: i })}
                mouseLeaveHandler={() => updateHover({ focusType: FocusType.NONE, focusInfo: undefined })}
            />)}
    </div>;
}