import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { Combatant, Team, Affiliation, initUnit, } from "../engine/types";
import { Focus, FocusType } from "./BattlePane";
import { AddUnitPortrait, UnitPortrait } from "./UnitPortrait";
import { UserMinusIcon } from "@heroicons/react/24/solid";

export function UnitTeam(
    {
        affiliation,
        team,
        updateFocus,
        updateHover,
        updater,
    }: {
        affiliation: Affiliation,
        team: Team, //TODO: this never changes team itself, which can make React-ing hard?
        updateFocus: Dispatch<SetStateAction<Focus>>,
        updateHover: Dispatch<SetStateAction<Focus>>,
        updater?: (newTeam: Team) => void,
    }) {

    return <div className="flex">
        <div className="flex">
            {
                team.units.map((unit, i) =>
                    <div className="relative" key={`combatant-${unit.uuid}`}>
                        <UnitPortrait unit={unit} affiliation={affiliation}
                            clickHandler={(evt) => {
                                evt.stopPropagation();
                                updateFocus({ type: FocusType.TEAM_UNIT, info: { affiliation, teamNumber: i } })
                            }}
                            mouseEnterHandler={() => updateHover({ type: FocusType.TEAM_UNIT, info: (affiliation === Affiliation.PLAYER) ? i : i + 7 })}
                            mouseLeaveHandler={() => updateHover({ type: FocusType.NONE, info: undefined })}
                        />
                        {updater && <RemoveUnitButton
                            clickHandler={(evt) => {
                                evt.stopPropagation();
                                // shallow copy ok
                                const copy = { ...team };
                                copy.units.splice(i, 1);
                                updater(copy);
                                updateFocus({ type: FocusType.NONE, info: undefined });
                            }} />}
                    </div>
                )
            }
        </div>
        <div>
            {updater && <AddUnitPortrait
                clickHandler={(evt) => {
                    evt.stopPropagation();
                    const copy = { ...team };
                    copy.units.push(initUnit());
                    updater(copy);
                    updateFocus({ type: FocusType.TEAM_UNIT, info: { affiliation, teamNumber: team.units.length - 1 } });
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