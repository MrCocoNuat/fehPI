import { GetStaticProps } from "next";
import { BattleMap } from "../components/BattleMap";
import { BattlePane } from "../components/BattlePane";
import { BattleTile, Terrain } from "../components/BattleTile";
import { Team } from "../components/UnitPortrait";

export default function TestComponent(props: {user: any}){
    const battleTiles : {terrain: Terrain, unit?: {idNum: number, team: Team}}[] = new Array(48).fill(
        {terrain: Terrain.NORMAL, unit: {idNum: 156, team: Team.PLAYER}}
        );
        
        console.log(`Check console for "SENTINEL" strings, leaking server-side information`);
        return <>
        <div className="flex justify-center">
        <BattlePane></BattlePane>
        </div>
        </>
    }
    
    export const getStaticProps : GetStaticProps = async () => {
        console.log("SENTINEL - client side means leak: STATIC PROPS");
        return {props: {user: "dummy"}};
    }
    