// very simple

import { getAllEnumValues } from "enum-for";
import { useContext } from "react";
import { SupportLevel, Unit } from "../../engine/types";
import { LanguageContext } from "../../pages/testpage";
import { Select } from "../tailwind-styled/sync/Select";
import { getUiStringResource, summonerSupportIcon } from "../ui-resources";
import { MultiplePropMerger, someSingleProp } from "./UnitBuilder";

const supportLevelResourceIds = {
    [SupportLevel.NONE]: "SUPPORT_NONE",
    [SupportLevel.C_SUPPORT]: "SUPPORT_C",
    [SupportLevel.B_SUPPORT]: "SUPPORT_B",
    [SupportLevel.A_SUPPORT]: "SUPPORT_A",
    [SupportLevel.S_SUPPORT]: "SUPPORT_S",
} as const;

export function SummonerSupportPicker({
    currentUnit,
    mergeChanges,
}: {
    currentUnit: Unit,
    mergeChanges: MultiplePropMerger,
}) {
    const selectedLanguage = useContext(LanguageContext);

    return <div className="flex items-center gap-2">
        <label htmlFor="unit-summoner-support" className="flex items-center">
            <div className="w-8 aspect-square m-1 relative">
                {summonerSupportIcon(currentUnit.summonerSupport)}
            </div>
            {getUiStringResource(selectedLanguage, "UNIT_SUMMONER_SUPPORT")}
        </label>
        <Select id={"unit-summoner-support"}
        className={"w-32"}
            value={currentUnit.summonerSupport}
            onChange={(choice) => mergeChanges(someSingleProp({ prop: "summonerSupport", value: choice!.value as SupportLevel }))}
            options={getAllEnumValues(SupportLevel).map(support =>
                ({ value: support, label: getUiStringResource(selectedLanguage, supportLevelResourceIds[support]) }))
            } />
    </div>
}

// Exports
// ----------

export function ensureSummonerSupportValidity(unit: Unit, justSetProp: keyof Unit) {
    // not that necessary
    switch (justSetProp) {
        case "idNum":
            unit.summonerSupport = SupportLevel.NONE;
    }
}