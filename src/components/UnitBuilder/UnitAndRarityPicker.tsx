import { gql, LazyQueryExecFunction, useLazyQuery, useQuery } from "@apollo/client"
import { getAllEnumEntries } from "enum-for"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Options } from "react-select"
import { Combatant, constrainNumeric, MAX_RARITY, MIN_RARITY, Rarity, Unit } from "../../engine/types"
import { Language } from "../../pages/api/dao/types/dao-types"
import { LanguageContext } from "../../pages/testpage"
import { HERO_NAME, HERO_NAME_FRAG } from "../api-fragments"
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect"
import { Select } from "../tailwind-styled/Select"
import { getUiStringResource } from "../ui-resources"
import { MultiplePropMerger } from "./UnitBuilder"

// Query
// ----------

const GET_ALL_HERO_NAMES = gql`
    ${HERO_NAME_FRAG}
    query getAllHeroNames($lang: OptionalLanguage!){
        heroes{
            idNum
            ...${HERO_NAME}
        }
    }
`;
type AllHeroNames = { idNum: number, name: { value: string }, epithet: { value: string } }[];

const mapHeroesQuery = (response: any) => response.data.heroes as AllHeroNames;


// Helpers
// ----------

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


// Loader
// ----------

const heroesLoaderFor = async (
    heroesQuery: LazyQueryExecFunction<any, any>,
) => {

    const heroesQueryResult = mapHeroesQuery(await heroesQuery());
    const valuesAndLabels = heroesQueryResult
        .map(hero => ({ value: hero.idNum, label: `${hero.name.value}: ${hero.epithet.value}` }))
    return valuesAndLabels;
}


// Component
// ----------

export function UnitAndRarityPicker(
    {
        currentCombatant,
        mergeChanges,
    }: {
        currentCombatant: Combatant,
        mergeChanges: MultiplePropMerger,
    }
    ) {
    console.info("rerender unitpicker");
    const selectedLanguage = useContext(LanguageContext);
    const rarityString = rarityStringForLanguage(selectedLanguage);

    const [heroesQuery] = useLazyQuery(GET_ALL_HERO_NAMES, {
        variables: { lang: Language[selectedLanguage] },
    });


    const [heroesLoader, setHeroesLoader] = useState(() => () => {
        return heroesLoaderFor(heroesQuery)
    })
    useEffect(() => setHeroesLoader(
        () => () => heroesLoaderFor(heroesQuery)
    ), [selectedLanguage])

    return <div className="flex flex-row items-center gap-2">
        <AsyncFilterSelect id="unit-idNum" className="min-w-[320px] flex-1"
            value={currentCombatant.unit.idNum}
            onChange={(choice) => { mergeChanges({prop: "idNum", value: +choice!.value}) }}
            loadOptions={heroesLoader} />
        <Select id="unit-rarity" className="w-18"
            value={currentCombatant.unit.rarity}
            onChange={(choice) => { mergeChanges({prop: "rarity", value: constrainNumeric(choice!.value, MIN_RARITY, MAX_RARITY)}) }}
            options={
                getAllEnumEntries(Rarity).map(([key, value]) => ({ value: value, label: rarityString(value) }))
            } />
    </div>
}