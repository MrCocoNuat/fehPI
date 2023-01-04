import { useState } from "react";
import { BattleMap } from "./BattleMap";
import { Terrain } from "./BattleTile";
import { BattleDuel } from "./BattleDuel";
import { Seeker } from "./Seeker";
import { Tab, TabSelector } from "./TabSelector";
import { Team } from "./UnitPortrait";
import { UnitTeam } from "./UnitTeam";
import { BattleHistory } from "./BattleHistory";

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

    const getRandomIdNum = () => Math.floor(600 * Math.random());
    const getRandomTeam: () => Team = () => Math.floor(2 * Math.random());
    const getRandomUnitMaybe = () => (Math.random() > 0.8) ? { idNum: getRandomIdNum(), team: getRandomTeam() } : undefined;

    const [battleTiles, updateBattleTiles] = useState(new Array(48).fill(0).map(() =>
        ({ terrain: Terrain.NORMAL, unit: getRandomUnitMaybe() })
    ));
    const [playerTeam, updatePlayerTeam] = useState(new Array(7).fill(0).map(() => { return { idNum: getRandomIdNum(), team: Team.PLAYER } }));
    const [enemyTeam, updateEnemyTeam] = useState(new Array(7).fill(0).map(() => { return { idNum: getRandomIdNum(), team: Team.ENEMY } }));


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
                <BattleMap tiles={battleTiles} updateFocus={updateFocus} updateHover={updateHover}></BattleMap>
            </div>
        </div>
        <div className="flex-initial flex flex-col">
            <TabSelector selectedTab={selectedTab} updateSelectedTab={updateSelectedTab}></TabSelector>
            <UnitTeam units={playerTeam} updateFocus={updateFocus} updateHover={updateHover} team={Team.PLAYER}></UnitTeam>
            <UnitTeam units={enemyTeam} updateFocus={updateFocus} updateHover={updateHover} team={Team.ENEMY}></UnitTeam>
            {(selectedTab === Tab.STATUS) && <>
                <BattleDuel></BattleDuel>
            </>}
            {(selectedTab === Tab.HISTORY) && <>
                <BattleHistory></BattleHistory>
            </>}
        </div>
    </div>
}