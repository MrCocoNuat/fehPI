import { useState } from "react";
import { BattleMapComponent } from "./BattleMap";
import { BattleDuelComponent } from "./BattleDuel";
import { Seeker } from "./Seeker";
import { Tab, TabSelector } from "./TabSelector";

import { UnitTeamComponent } from "./UnitTeam";
import { BattleHistoryComponent } from "./BattleHistory";
import { Combatant, Team } from "../engine/types";
import { generateBattleMap, generateTeams } from "../engine/mocks";
import { UnitBuilder } from "./UnitBuilder/UnitBuilder";

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

const {[Team.PLAYER]: basePlayerTeam, [Team.ENEMY]: baseEnemyTeam} = generateTeams();
const baseBattleMap = generateBattleMap();

export function BattlePane(props: any) {
    const [selectedTab, updateSelectedTab] = useState(Tab.STATUS);
    const [focus, updateFocus] = useState({ focusType: FocusType.NONE, focusInfo: undefined } as Focus);
    const [hover, updateHoverDisabled] = useState({ focusType: FocusType.NONE, focusInfo: undefined } as Focus);
    const updateHover = () => {};

    const [playerTeam, updatePlayerTeam] = useState(basePlayerTeam);
    const [enemyTeam, updateEnemyTeam] = useState(baseEnemyTeam);
    const [battleTiles, updateBattleTiles] = useState(baseBattleMap);

    function getCombatant({focusType, focusInfo} : Focus) {
        switch (focusType) {
            //case FocusType.TILE_UNIT:
             //   return battleTiles[focusInfo].combatant;
            case FocusType.TEAM_UNIT:
                return (focusInfo < 7)?
                playerTeam[focusInfo] :
                enemyTeam[focusInfo - 7]
            default:
                return undefined;
        }
    }
    function updateCombatant(team: Team, teamNumber: number, newCombatant : Combatant){
        const [selectedTeam, selectedUpdate] = (team === Team.PLAYER)? [playerTeam,updatePlayerTeam] : [enemyTeam, updateEnemyTeam];
        const copy = [...selectedTeam];
        copy[teamNumber] = newCombatant;
        selectedUpdate(copy);
    }

    const focusCombatant = getCombatant(focus);

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
                <BattleMapComponent tiles={battleTiles} allCombatants={playerTeam.concat(enemyTeam)} updateFocus={updateFocus} updateHover={updateHover}></BattleMapComponent>
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
            {(focus.focusType === FocusType.TILE_UNIT || focus.focusType === FocusType.TEAM_UNIT) && focusCombatant !== undefined && <>
                <UnitBuilder combatant={focusCombatant} updater={(newCombatant: Combatant) => updateCombatant(focusCombatant.team, focusCombatant.teamNumber, newCombatant)}></UnitBuilder>
            </>}
        </div>
    </div>
}

