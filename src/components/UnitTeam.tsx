import { Dispatch, SetStateAction } from "react";
import { Combatant, CombatantTeam, Team } from "../engine/types";
import { Focus, FocusType } from "./BattlePane";
import { UnitPortrait } from "./UnitPortrait";

export function UnitTeamComponent(
    {
        team,
        units,
        updateFocus,
        updateHover
    }: {
        team: Team,
        units: CombatantTeam,
        updateFocus: Dispatch<SetStateAction<Focus>>,
        updateHover: Dispatch<SetStateAction<Focus>>,
    }) {

    return <div className="flex">{
        units.map((unit, i) => <UnitPortrait key={i} combatant={unit}
            clickHandler={(evt) => { evt.stopPropagation(); updateFocus({ focusType: FocusType.TEAM_UNIT, focusInfo: (team === Team.PLAYER) ? i : i + 7 }) }}
            mouseEnterHandler={() => updateHover({ focusType: FocusType.TEAM_UNIT, focusInfo: (team === Team.PLAYER) ? i : i + 7 })}
            mouseLeaveHandler={() => updateHover({ focusType: FocusType.NONE, focusInfo: undefined })}
        ></UnitPortrait>)
    }</div>
}