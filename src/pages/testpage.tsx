import { GetStaticProps } from "next";
import Head from "next/head";
import { BattlePane } from "../components/BattlePane";
import { Terrain } from "../components/BattleTile";
import { Team } from "../components/UnitPortrait";
import { apolloClient } from "../components/api";
import { gql } from "@apollo/client";

export default function TestComponent(props: { user: any }) {
    const battleTiles: { terrain: Terrain, unit?: { idNum: number, team: Team } }[] = new Array(48).fill(
        { terrain: Terrain.NORMAL, unit: { idNum: 156, team: Team.PLAYER } }
    );

    console.log(`Check console for "SENTINEL" strings, leaking server-side information`);
    apolloClient.query({
        query: gql`{
          ping
        }`,
    }).then((result) => console.log(result));

    //LANG-
    return <>

        <Head>
            <title>Turnwheel</title>
            <meta name="description" content="turnwheel" />
        </Head>

        <nav className="bg-red-900 text-white h-[50px] w-full fixed top-0 flex justify-between items-center">
            <div>logo</div>
            <div>name</div>
            <div>lang</div>
        </nav>

        <main className="flex justify-center mt-[100px]">
            <BattlePane></BattlePane>
        </main>
    </>
}

export const getStaticProps: GetStaticProps = async () => {
    console.log("SENTINEL - client side means leak: STATIC PROPS");
    return { props: { user: "dummy" } };
}
