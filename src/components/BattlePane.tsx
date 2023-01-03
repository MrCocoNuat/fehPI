import { useState } from "react";
import { BattleMap } from "./BattleMap";
import { Terrain } from "./BattleTile";
import { BattleDuel } from "./BattleDuel";
import { Seeker } from "./Seeker";
import { Tab, TabSelector } from "./TabSelector";
import { Team } from "./UnitPortrait";
import { UnitTeam } from "./UnitTeam";
import { BattleHistory } from "./BattleHistory";

export function BattlePane(props: any) {
    const [selectedTab, updateSelectedTab] = useState(Tab.STATUS);

    const getRandomIdNum = () => Math.floor(600 * Math.random());
    const getRandomTeam: () => Team = () => Math.floor(2 * Math.random());

    const [battleTiles, updateBattleTiles] = useState(new Array(48).fill(0).map(() =>
        ({ terrain: Terrain.NORMAL, unit: { idNum: getRandomIdNum(), team: getRandomTeam() } })
    ));
    const [playerTeam, updatePlayerTeam] = useState(new Array(7).fill(0).map(() => { return { idNum: getRandomIdNum(), team: getRandomTeam() } }));
    const [enemyTeam, updateEnemyTeam] = useState(new Array(7).fill(0).map(() => { return { idNum: getRandomIdNum(), team: getRandomTeam() } }));

    return <div className="flex flex-col md:flex-row border-2 border-green-900 md:min-w-[800px]">
        <div className="flex-initial flex flex-col">
            <Seeker></Seeker>
            <BattleMap tiles={battleTiles} ></BattleMap>
        </div>
        <div className="flex-initial flex flex-col">
            <TabSelector selectedTab={selectedTab} updateSelectedTab={updateSelectedTab}></TabSelector>
            <UnitTeam units={playerTeam}></UnitTeam>
            <UnitTeam units={enemyTeam}></UnitTeam>
            {(selectedTab === Tab.STATUS) && <>
                <BattleDuel></BattleDuel>
            </>}
            {(selectedTab === Tab.HISTORY) && <>
                <BattleHistory></BattleHistory>
            </>}
        </div>
    </div>
}