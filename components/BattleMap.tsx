import { BattleTile, Terrain } from "./BattleTile";
import { Team } from "./UnitPortrait";

export function BattleMap({tiles}: {tiles: {unit? : {team: Team, idNum: number}, terrain: Terrain}[]}){
    return <div className="battle-map">
        {tiles.map((tile, i) => <BattleTile key={i} unit={tile.unit} terrain={tile.terrain} ></BattleTile>)}
    </div>
}