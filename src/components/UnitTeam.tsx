import { Dispatch, SetStateAction } from "react";
import { Combatant, Army, Affiliation, initUnit } from "../engine/types";
import { Focus, FocusType } from "./BattlePane";
import { AddUnitPortrait, UnitPortrait } from "./UnitPortrait";

export function UnitTeam(
    {
        affiliation,
        team,
        updateFocus,
        updateHover
    }: {
        affiliation: Affiliation,
        team: Army,
        updateFocus: Dispatch<SetStateAction<Focus>>,
        updateHover: Dispatch<SetStateAction<Focus>>,
    }) {

    return <div className="flex">
        {
            team.combatants.map((combatant, i) => <UnitPortrait key={i} unit={combatant.unit} affiliation={affiliation}
                clickHandler={(evt) => { evt.stopPropagation(); updateFocus({ type: FocusType.TEAM_UNIT, info: { affiliation, teamNumber: i } }) }}
                mouseEnterHandler={() => updateHover({ type: FocusType.TEAM_UNIT, info: (affiliation === Affiliation.PLAYER) ? i : i + 7 })}
                mouseLeaveHandler={() => updateHover({ type: FocusType.NONE, info: undefined })}
            />)
        }
        <AddUnitPortrait
            clickHandler={(evt) => team.combatants.push({ unit: initUnit() })} />
    </div>
}