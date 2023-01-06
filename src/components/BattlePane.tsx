import { useState } from "react";
import { BattleMapComponent } from "./BattleMap";
import { BattleDuelComponent } from "./BattleDuel";
import { Seeker } from "./Seeker";
import { Tab, TabSelector } from "./TabSelector";

import { UnitTeamComponent } from "./UnitTeam";
import { BattleHistoryComponent } from "./BattleHistory";
import { Team } from "../engine/types";
import { getRandomBattleMap, getRandomCombatantTeam } from "../engine/mocks";
import { ReactUnitBuilder } from "./ReactUnitBuilder";

export enum FocusType {
    TILE,
    TILE_UNIT,
    TEAM_UNIT,
    NONE,
}
export type Focus = {
    focusType: FocusType,
    focusInfo: any // right now always number
}

export function BattlePane(props: any) {
    const [selectedTab, updateSelectedTab] = useState(Tab.STATUS);
    const [focus, updateFocus] = useState({ focusType: FocusType.NONE, focusInfo: undefined } as Focus);
    const [hover, updateHover] = useState({ focusType: FocusType.NONE, focusInfo: undefined } as Focus);

    const [battleTiles, updateBattleTiles] = useState(getRandomBattleMap());
    const [playerTeam, updatePlayerTeam] = useState(getRandomCombatantTeam(Team.PLAYER));
    const [enemyTeam, updateEnemyTeam] = useState(getRandomCombatantTeam(Team.ENEMY));

    function getCombatant({focusType, focusInfo} : Focus) {
        switch (focusType) {
            case FocusType.TILE_UNIT:
                return battleTiles[focusInfo].combatant;
            case FocusType.TEAM_UNIT:
                return (focusInfo < 7)?
                {unit: playerTeam[focusInfo].unit, team: Team.PLAYER} :
                {unit: enemyTeam[focusInfo - 7].unit, team: Team.ENEMY}
            default:
                return undefined;
        }
    }

    return <div className="flex flex-col 2xl:flex-row gap-2 2xl:gap-5 border-2 border-green-900 p-2 2xl:p-5"
        // any click not stopped will bubble here and clear the focus
        onClick={(evt) => { evt.stopPropagation(); updateFocus({ focusType: FocusType.NONE, focusInfo: undefined }) }}>

        <div className="flex justify-center">
            <div className="flex flex-initial flex-col">

                <div className="absolute top-12">
                    Focus: {FocusType[focus.focusType]} param: {focus.focusInfo} -
                    Hover: {FocusType[hover.focusType]} param: {hover.focusInfo}
                </div>
                <Seeker></Seeker>
                <BattleMapComponent tiles={battleTiles} updateFocus={updateFocus} updateHover={updateHover}></BattleMapComponent>
            </div>
        </div>
        <div className="flex-initial flex flex-col">
            <TabSelector selectedTab={selectedTab} updateSelectedTab={updateSelectedTab}></TabSelector>
            <UnitTeamComponent units={playerTeam} updateFocus={updateFocus} updateHover={updateHover} team={Team.PLAYER}></UnitTeamComponent>
            <UnitTeamComponent units={enemyTeam} updateFocus={updateFocus} updateHover={updateHover} team={Team.ENEMY}></UnitTeamComponent>
            {(selectedTab === Tab.STATUS) && focus.focusType === FocusType.NONE && <>
                <BattleDuelComponent></BattleDuelComponent>
            </>}
            {(selectedTab === Tab.HISTORY) && focus.focusType === FocusType.NONE && <>
                <BattleHistoryComponent></BattleHistoryComponent>
            </>}
            {(focus.focusType === FocusType.TILE_UNIT || focus.focusType === FocusType.TEAM_UNIT) && <>
                <ReactUnitBuilder combatant={getCombatant(focus)}></ReactUnitBuilder>
            </>}
        </div>
    </div>
}

