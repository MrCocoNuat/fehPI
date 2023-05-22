import { useState } from "react";
import { BattleMapComponent } from "./BattleMap";
import { BattleDuelComponent } from "./BattleDuel";
import { Seeker } from "./Seeker";
import { Tab, TabSelector } from "./TabSelector";

import { UnitTeam } from "./UnitTeam";
import { BattleHistoryComponent } from "./BattleHistory";
import { Combatant, Affiliation, emptyTeam, Unit } from "../engine/types";
import { generateBattleMap, generateTeams } from "../engine/mocks";
import { UnitBuilder } from "./UnitBuilder/UnitBuilder";
import { empty } from "@apollo/client";

export enum FocusType {
    TILE,
    TILE_UNIT,
    TEAM_UNIT,
    NONE,
}
export type Focus = {
    type: FocusType,
    info: any
}

//const {[Affiliation.PLAYER]: basePlayerTeam, [Affiliation.ENEMY]: baseEnemyTeam} = generateTeams();
const baseBattleMap = generateBattleMap();

export function BattlePane(props: any) {
    const [selectedTab, updateSelectedTab] = useState(Tab.STATUS);
    const [focus, updateFocus] = useState({ type: FocusType.NONE, info: undefined } as Focus);
    const [hover, updateHoverDisabled] = useState({ type: FocusType.NONE, info: undefined } as Focus);
    const updateHover = () => {};

    const [armies, setArmies] = useState({[Affiliation.PLAYER]: emptyTeam(), [Affiliation.ENEMY]: emptyTeam()})
    const [battleTiles, updateBattleTiles] = useState(baseBattleMap);

    function getUnit({type, info} : Focus) {
        switch (type) {
            //case FocusType.TILE_UNIT:
             //   return battleTiles[focusInfo].combatant;
            case FocusType.TEAM_UNIT:
                return armies[info.affiliation as Affiliation].units[info.teamNumber];
            default:
                return undefined;
        }
    }
    function updateUnit(affiliation: Affiliation, teamNumber: number, newUnit : Unit){
        const copy = {...armies};
        copy[affiliation].units[teamNumber] = newUnit;
        setArmies(copy);
    }

    const focusUnit = getUnit(focus);

    return <div className="flex flex-col 2xl:flex-row gap-2 2xl:gap-5 border-2 border-green-900 p-2 2xl:p-5"
        // any click not stopped will bubble here and clear the focus
        onClick={(evt) => { evt.stopPropagation(); updateFocus({ type: FocusType.NONE, info: undefined }) }}>

        <div className="flex justify-center">
            <div className="flex flex-initial flex-col">

                <div className="absolute top-12">
                    Focus: {FocusType[focus.type]} param: {JSON.stringify(focus.info)} -
                    Hover: {FocusType[hover.type]} param: {JSON.stringify(hover.info)}
                </div>
                <Seeker></Seeker>
                <BattleMapComponent tiles={battleTiles} armies={armies} updateFocus={updateFocus} updateHover={updateHover}></BattleMapComponent>
            </div>
        </div>
        <div className="flex-initial flex flex-col">
            <TabSelector selectedTab={selectedTab} updateSelectedTab={updateSelectedTab}></TabSelector>
            <UnitTeam team={armies[Affiliation.PLAYER]} updateFocus={updateFocus} updateHover={updateHover} affiliation={Affiliation.PLAYER} writable={true}></UnitTeam>
            <UnitTeam team={armies[Affiliation.ENEMY]} updateFocus={updateFocus} updateHover={updateHover} affiliation={Affiliation.ENEMY} writable={true}></UnitTeam>
            {(selectedTab === Tab.STATUS) && focus.type === FocusType.NONE && <>
                <BattleDuelComponent></BattleDuelComponent>
            </>}
            {(selectedTab === Tab.HISTORY) && focus.type === FocusType.NONE && <>
                <BattleHistoryComponent></BattleHistoryComponent>
            </>}
            {(focus.type === FocusType.TILE_UNIT || focus.type === FocusType.TEAM_UNIT) && focusUnit !== undefined && <>
                <UnitBuilder unit={focusUnit} updater={(newUnit: Unit) => updateUnit(focus.info.affiliation, focus.info.teamNumber, newUnit)}></UnitBuilder>
            </>}
        </div>
    </div>
}

