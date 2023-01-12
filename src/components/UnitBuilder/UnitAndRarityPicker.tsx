import { gql, useLazyQuery, useQuery } from "@apollo/client"
import { getAllEnumEntries } from "enum-for"
import { useCallback, useContext, useEffect, useState } from "react"
import { Options } from "react-select"
import { Combatant, Rarity, Unit } from "../../engine/types"
import { Language } from "../../pages/api/dao/types/dao-types"
import { LanguageContext } from "../../pages/testpage"
import { HERO_NAME_FRAG } from "../api-fragments"
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect"
import { Select } from "../tailwind-styled/Select"
import { getUiStringResource } from "../ui-resources"

const GET_ALL_HERO_NAMES = gql`
    ${HERO_NAME_FRAG}
    query getAllHeroNames($lang: OptionalLanguage!){
        heroes{
            id
            ...HeroName
        }
    }
`;
type AllHeroNames = { id: number, name: { value: string }, epithet: { value: string } }[];

const rarityStringResourceIds = {
    [Rarity.ONE_STAR]: "UNIT_RARITY_ONE",
    [Rarity.TWO_STARS]: "UNIT_RARITY_TWO",
    [Rarity.THREE_STARS]: "UNIT_RARITY_THREE",
    [Rarity.FOUR_STARS]: "UNIT_RARITY_FOUR",
    [Rarity.FIVE_STARS]: "UNIT_RARITY_FIVE",
} as const;
function rarityStringForLanguage(langauge: Language) {
    return (rarity: Rarity) => getUiStringResource(langauge, rarityStringResourceIds[rarity]);
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
    const rarityString = rarityStringForLanguage(selectedLanguage);

    const [getHeroNames] = useLazyQuery(GET_ALL_HERO_NAMES, {
        variables: { lang: Language[selectedLanguage] },
    });
    const loadInitialOptions = useCallback(async () => {
        const queryResult = await getHeroNames();
        return (queryResult.data.heroes as AllHeroNames)
            .map(hero => ({ value: hero.id, label: `${hero.name.value}: ${hero.epithet.value}` }))
    }, [selectedLanguage])

    console.log("rerender unitpicker");
    return <div className="flex flex-row items-center gap-2">
        <AsyncFilterSelect id="unit-idNum" className="w-80"
            value={currentCombatant.unit.idNum}
            onChange={(choice) => { mergeChanges("idNum", +choice!.value) }}
            loadInitialOptions={loadInitialOptions} />
        <Select id="unit-rarity" className="w-18"
            value={currentCombatant.unit.rarity}
            onChange={(choice) => { mergeChanges("rarity", choice!.value) }}
            options={
                getAllEnumEntries(Rarity).map(([key, value]) => ({ value: value, label: rarityString(value) }))
            } />
    </div>
}