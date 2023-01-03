import { GetStaticProps } from "next";
import Head from "next/head";
import { BattlePane } from "../components/BattlePane";
import { Terrain } from "../components/BattleTile";
import { useTheme } from "next-themes";
import { PING } from "../components/api";
import { useQuery } from "@apollo/client";
import { TopBar } from "../components/TopBar";

export default function TestComponent(props: { user: any }) {
    const { loading, data, error } = useQuery(PING);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    console.log(`Check console for "SENTINEL" strings, leaking server-side information`);
    console.log(`graphql reply: ${JSON.stringify(data)}`);
    //LANG-
    return <>
        <Head>
            <title>Turnwheel</title>
            <meta name="description" content="turnwheel" />
        </Head>

        <TopBar/>

        <main className="dark:bg-black dark:text-white">
            <div className="flex justify-center">
                <BattlePane></BattlePane>
            </div>
        </main>

    </>
}

export const getStaticProps: GetStaticProps = async () => {
    console.log("SENTINEL - client side means leak: STATIC PROPS");
    return { props: { user: "dummy" } };
}
