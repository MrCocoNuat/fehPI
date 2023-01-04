import { Dispatch, SetStateAction } from "react";
import { Focus, FocusType } from "./BattlePane";
import { BattleTile, Terrain } from "./BattleTile";
import { Team } from "./UnitPortrait";

export function BattleMap({ tiles, updateFocus, updateHover }:
    {
        tiles: {
            unit?: { team: Team, idNum: number },
            terrain: Terrain
        }[],
        updateFocus: Dispatch<SetStateAction<Focus>>,
        updateHover: Dispatch<SetStateAction<Focus>>,
    }) {
    return <div className="grid grid-cols-6">
        {tiles.map((tile, i) =>
            <BattleTile key={i} unit={tile.unit} terrain={tile.terrain}
                clickHandler={(evt) => {evt.stopPropagation(); updateFocus({ focusType: FocusType.TILE_UNIT, focusInfo: i })}}
                mouseEnterHandler={() => updateHover({ focusType: FocusType.TILE_UNIT, focusInfo: i })}
                mouseLeaveHandler={() => updateHover({ focusType: FocusType.NONE, focusInfo: undefined })}
            />)}
    </div>;
}