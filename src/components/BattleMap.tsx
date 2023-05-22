import { Dispatch, SetStateAction } from "react";
import { BattleMap, Combatant, Team, Affiliation, Terrain, Teams } from "../engine/types";
import { Focus, FocusType } from "./BattlePane";
import { BattleTileComponent } from "./BattleTile";


export function BattleMapComponent(
    {
        tiles,
        armies,
        updateFocus,
        updateHover
    }: {
        tiles: BattleMap,
        armies : Teams,
        updateFocus: Dispatch<SetStateAction<Focus>>,
        updateHover: Dispatch<SetStateAction<Focus>>,
    }) {

    const allCombatants = Object.values(armies).reduce((accum, currentTeam) => accum.concat(currentTeam.units), [] as Combatant[]);

    return <div className="grid grid-cols-6">
        {tiles.map((tile, i) =>
            <BattleTileComponent key={i} battleUnit={allCombatants.find(combatant => combatant.tileNumber === i)} terrain={tile.terrain}
                clickHandlerWith={(focusType: FocusType) => (evt) => { evt.stopPropagation(); updateFocus({ type: focusType, info: i }) }}
                mouseEnterHandler={() => updateHover({ type: FocusType.TILE_UNIT, info: i })}
                mouseLeaveHandler={() => updateHover({ type: FocusType.NONE, info: undefined })}
            />)}
    </div>;
}