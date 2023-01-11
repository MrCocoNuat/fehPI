import { useLazyQuery, useQuery } from "@apollo/client"
import { getAllEnumEntries } from "enum-for"
import { useContext, useEffect, useState } from "react"
import { Options } from "react-select"
import { Combatant, Rarity, Unit } from "../../engine/types"
import { Language } from "../../pages/api/dao/types/dao-types"
import { LanguageContext } from "../../pages/testpage"
import { GET_ALL_HERO_NAMES } from "../api"
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect"
import { FilterSelect, ValueAndLabel } from "../tailwind-styled/FilterSelect"
import { Select } from "../tailwind-styled/Select"
import { getUiStringResource } from "../ui-resources"



function rarityStringsForLanguage(langauge: Language) {
    return (rarity: Rarity) => getUiStringResource(langauge, "UNIT_RARITY")[rarity];
}


export function UnitAndRarityPicker(
    {
        currentCombatant,
        mergeChanges,
    }: {
        currentCombatant: Combatant,
        mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    }
) {
    const selectedLanguage = useContext(LanguageContext);
    const rarityString = rarityStringsForLanguage(selectedLanguage);

    const [getHeroNames] = useLazyQuery(GET_ALL_HERO_NAMES, {
        variables: { lang: Language[selectedLanguage] },
    });
    const loadInitialOptions = async () => {
        console.log("slow hero query");
        const queryResult = await getHeroNames();
        return (queryResult.data.heroes as { idNum: number, name: { value: string }, epithet: { value: string } }[])
            .map(hero => ({ value: hero.idNum, label: `${hero.name.value}: ${hero.epithet.value}` }))
    }


    console.log("rerender unitpicker");
    return <div className="flex flex-row items-center gap-2">
        <AsyncFilterSelect id="unit-idNum" className="w-80"
            value={currentCombatant.unit.idNum}
            onChange={(choice) => { mergeChanges("idNum", +choice!.value) }}
            loadInitialOptions={loadInitialOptions}
            otherDependencies={[selectedLanguage]} />
        <Select id="unit-rarity" className="w-18"
            value={{ value: currentCombatant.unit.rarity, label: rarityString(currentCombatant.unit.rarity) }}
            onChange={(choice) => { mergeChanges("rarity", choice!.value) }}
            options={
                getAllEnumEntries(Rarity).map(([key, value]) => ({ value: value, label: rarityString(value) }))
            } />
    </div>
}