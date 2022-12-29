import { GetStaticProps } from "next";
import { BattleMap } from "../components/BattleMap";
import { BattleTile, Terrain } from "../components/BattleTile";
import { Team } from "../components/UnitPortrait";

export default function TestComponent(props: {user: any}){
    const battleTiles : {terrain: Terrain, unit?: {idNum: number, team: Team}}[] = [
        {terrain: Terrain.DEFENSIVE},
        {terrain: Terrain.NORMAL, unit: {idNum: 156, team: Team.PLAYER}},
        {terrain: Terrain.WALL_UNBREAKABLE, unit: {idNum: 158, team: Team.ENEMY}},
    ] 
    
    return <>
    <div>static props: {props.user}</div>
    <div>Check console for "SENTINEL" strings, leaking server-side information</div>

    <BattleMap tiles={battleTiles}/>
    </>
}

export const getStaticProps : GetStaticProps = async () => {
    console.log("SENTINEL - client side means leak: STATIC PROPS");
    return {props: {user: "dummy"}};
}
