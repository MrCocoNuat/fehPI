import { useContext } from "react";
import { OptionalStat, ParameterPerStat, Stat, StatEnumValues, sameStats } from "../../pages/api/dao/types/dao-types";
import { Traits } from "./StatCalculator";
import { LanguageContext } from "../../pages/_app";
import { getUiStringResource, statStringsForLanguage } from "../ui-resources";
import { getAllEnumEntries, getAllEnumValues } from "enum-for";
import { json } from "stream/consumers";
import { appendObjectFields } from "@graphql-tools/utils";

function ColoredNumber({ n, assetOrFlaw }: { n: number, assetOrFlaw: (keyof Traits)[] }) {
    let points = 0;
    if (assetOrFlaw.find(key => key === "asset" || key === "ascension")) {
        points++;
    }
    if (assetOrFlaw.find(key => key === "flaw")) {
        points--;
    }
    switch (points) {
        case -1:
            return <div className="text-xl text-red-600">{n}</div>
        case 1:
            return <div className="text-xl text-cyan-600">{n}</div>
        default:
            return <div className="text-xl">{n}</div>
    }
}

export function StatDisplay(props: { stats: ParameterPerStat, traits: Traits }) {
    const selectedLanguage = useContext(LanguageContext);
    const statString = statStringsForLanguage(selectedLanguage);

    return <div className="flex flex-row justify-around border-2 border-gray-500">
        {StatEnumValues.map(stat =>
            <div key={stat} className="flex flex-col items-center">
                <div>{statString(stat)}</div>
                <ColoredNumber n={props.stats[stat]}
                    assetOrFlaw={(Object.entries(props.traits) as ([keyof Traits, OptionalStat])[])
                        .filter(([k, v]) => sameStats(v, stat))
                        .map(([k,]) => k)} />
            </div>)}
    </div>;
}