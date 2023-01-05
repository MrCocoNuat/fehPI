import { GetStaticProps } from "next";
import Head from "next/head";
import { BattlePane } from "../components/BattlePane";
import { PING } from "../components/api";
import { useQuery } from "@apollo/client";
import { TopBar } from "../components/TopBar";
import { createContext, useState } from "react";
import { Language } from "../dao/types/dao-types";

export const LanguageContext = createContext(Language.USEN);

export default function TestComponent(props: { user: any }) {

    const [currentLanguage, updateCurrentLanguage] = useState(Language.USEN);

    const { loading, data, error } = useQuery(PING);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    console.log(`Check console for "SENTINEL" strings, leaking server-side information`);
    console.log(`graphql reply: ${JSON.stringify(data)}`);

    //LANG-
    return <>
        <LanguageContext.Provider value={currentLanguage}>
            <Head>
                <title>Turnwheel</title>
                <meta name="description" content="turnwheel" />
            </Head>

            <TopBar currentLanguage={currentLanguage} updateCurrentLanguage={updateCurrentLanguage} />

            <main className="">
                <div className="flex justify-center">
                    <BattlePane></BattlePane>
                </div>
            </main>
        </LanguageContext.Provider>
    </>
}

export const getStaticProps: GetStaticProps = async () => {
    console.log("SENTINEL - client side means leak: STATIC PROPS");
    return { props: { user: "dummy" } };
}
