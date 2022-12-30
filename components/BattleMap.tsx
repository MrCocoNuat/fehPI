import { BattleTile, Terrain } from "./BattleTile";
import { Team } from "./UnitPortrait";

export function BattleMap({tiles}: {tiles: {unit? : {team: Team, idNum: number}, terrain: Terrain}[]}){
    return <div className="grid grid-cols-6">
        {tiles.map((tile, i) => <BattleTile key={i} unit={tile.unit} terrain={tile.terrain} ></BattleTile>)}
    </div>;
}