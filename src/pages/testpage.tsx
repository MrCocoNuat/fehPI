import { GetStaticProps } from "next";
import Head from "next/head";
import { BattlePane } from "../components/BattlePane";
import { PING } from "../components/api-fragments";
import { useQuery } from "@apollo/client";
import { TopBar } from "../components/TopBar";
import { createContext, useState } from "react";
import { Language } from "./api/dao/types/dao-types";


export default function TestComponent(props: { user: any }) {


    const { loading, data, error } = useQuery(PING);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    console.log(`Check console for "SENTINEL" strings, leaking server-side information`);
    console.log(`ping graphql reply: ${JSON.stringify(data)}`);

    //LANG-
    return <>
        
            <Head>
                <title>Turnwheel</title>
                <meta name="description" content="turnwheel" />
            </Head>

            

            <main className="">
                <div className="flex justify-center">
                    <BattlePane></BattlePane>
                </div>
            </main>
    </>
}

export const getStaticProps: GetStaticProps = async () => {
    console.error("SENTINEL - client side means leak: STATIC PROPS");
    return { props: { user: "dummy" } };
}
