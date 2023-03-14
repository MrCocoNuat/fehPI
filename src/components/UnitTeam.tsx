import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { Combatant, Army, Affiliation, initUnit, initCombatant } from "../engine/types";
import { Focus, FocusType } from "./BattlePane";
import { AddUnitPortrait, UnitPortrait } from "./UnitPortrait";
import { UserMinusIcon } from "@heroicons/react/24/solid";

export function UnitTeam(
    {
        affiliation,
        team,
        updateFocus,
        updateHover,
        writable,
    }: {
        affiliation: Affiliation,
        team: Army,
        updateFocus: Dispatch<SetStateAction<Focus>>,
        updateHover: Dispatch<SetStateAction<Focus>>,
        writable?: boolean,
    }) {

    return <div className="flex">
        <div className="flex">
            {
                team.combatants.map((combatant, i) =>
                    <div className="relative" key={`combatant-${combatant.uid}`}>
                        <UnitPortrait unit={combatant.unit} affiliation={affiliation}
                            clickHandler={(evt) => {
                                evt.stopPropagation();
                                updateFocus({ type: FocusType.TEAM_UNIT, info: { affiliation, teamNumber: i } })
                            }}
                            mouseEnterHandler={() => updateHover({ type: FocusType.TEAM_UNIT, info: (affiliation === Affiliation.PLAYER) ? i : i + 7 })}
                            mouseLeaveHandler={() => updateHover({ type: FocusType.NONE, info: undefined })}
                        />
                        {writable && <RemoveUnitButton
                            clickHandler={(evt) => {
                                evt.stopPropagation();
                                team.combatants.splice(i, 1);
                                updateFocus({ type: FocusType.NONE, info: undefined });
                            }} />}
                    </div>
                )
            }
        </div>
        <div>
            {writable && <AddUnitPortrait
                clickHandler={(evt) => {
                    evt.stopPropagation();
                    team.combatants.push(initCombatant());
                    updateFocus({ type: FocusType.TEAM_UNIT, info: { affiliation, teamNumber: team.combatants.length - 1 } });
                }} />
            }
        </div>
    </div>
}

function RemoveUnitButton({ clickHandler }: { clickHandler: MouseEventHandler }) {
    // need transparent bg without affecting the button
    return <div className="bg-[rgba(255,0,0,0.5)] hover:bg-[rgba(255,0,0,0.8)] absolute top-0 right-0 "
        onClick={clickHandler}>
        <UserMinusIcon className=" w-4 md:w-6 m-1 opacity-100 aspect-square" />
    </div>
}