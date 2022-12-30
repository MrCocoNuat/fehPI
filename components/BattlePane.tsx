import { BattleMap } from "./BattleMap";
import { Terrain } from "./BattleTile";
import { Duel } from "./Duel";
import { Seeker } from "./Seeker";
import { TabSelector } from "./TabSelector";
import { Team } from "./UnitPortrait";
import { UnitTeam } from "./UnitTeam";

export function BattlePane(props: any){
    const battleTiles : {terrain: Terrain, unit?: {idNum: number, team: Team}}[] = new Array(48).fill(
        {terrain: Terrain.NORMAL, unit: {idNum: 156, team: Team.PLAYER}}
        );
    const team = new Array(4).fill({idNum:156, team: Team.PLAYER});

    return <div className="flex border-2 border-green-900 min-w-[800px]">
        <div className="flex-initial flex flex-col">
            <Seeker></Seeker>
            <BattleMap tiles={battleTiles} ></BattleMap>
        </div>
        <div className="flex-initial flex flex-col">
                <TabSelector></TabSelector>
                <UnitTeam units={team}></UnitTeam>
                <UnitTeam units={team}></UnitTeam>
                <Duel></Duel>
        </div>
    </div>
}