import { GetStaticProps } from "next";
import Head from "next/head";
import { BattlePane } from "../components/BattlePane";
import { Terrain } from "../components/BattleTile";
import { useTheme } from "next-themes";
import { PING } from "../components/api";
import { useQuery } from "@apollo/client";

export default function TestComponent(props: { user: any }) {
    const { loading, data, error } = useQuery(PING);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;
    const {theme, setTheme} = useTheme();

    console.log(`Check console for "SENTINEL" strings, leaking server-side information`);
    console.log(`graphql reply: ${JSON.stringify(data)}`);
    //LANG-
    return <>
        <Head>
            <title>Turnwheel</title>
            <meta name="description" content="turnwheel" />
        </Head>
        <div className="h-max">
            <nav className="bg-red-900 text-white h-[50px] w-full sticky top-0 flex justify-between items-center z-50">
                <div>logo</div>
                <div>name</div>
                <div className="flex">
                    <div onClick={
                        () => {
                            setTheme((theme === "dark")? "light" : "dark");
                        }
                    }>dark</div>
                    <div>lang</div>
                </div>
            </nav>

            <main className="dark:bg-black dark:text-white">
                <div className="flex justify-center">
                    <BattlePane></BattlePane>
                </div>
            </main>
        </div>
    </>
}

export const getStaticProps: GetStaticProps = async () => {
    console.log("SENTINEL - client side means leak: STATIC PROPS");
    return { props: { user: "dummy" } };
}
