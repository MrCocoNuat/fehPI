import { getAllEnumEntries } from "enum-for"
import { useContext } from "react"
import { Combatant, Rarity, Unit } from "../../engine/types"
import { Language } from "../../pages/api/dao/types/dao-types"
import { LanguageContext } from "../../pages/testpage"
import { FilterSelect } from "../tailwind-styled/FilterSelect"
import { Select } from "../tailwind-styled/Select"
import { getUiStringResource } from "../ui-resources"



function rarityStringsForLanguage(langauge: Language) {
    return (rarity: Rarity) => getUiStringResource(langauge, "UNIT_RARITY")[rarity];
}

export function UnitAndRarityPicker(
    {
        currentCombatant,
        allHeroes,
        mergeChanges,
    }: {
        currentCombatant: Combatant,
        allHeroes: { idNum: number, name: { value: string }, epithet: { value: string } }[],
        mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    }
) {
    const selectedLanguage = useContext(LanguageContext);
    const rarityString = rarityStringsForLanguage(selectedLanguage);

    return <div className="flex flex-row items-center gap-2">
        <FilterSelect id="unit-idNum" className="w-80"
            value={{ value: currentCombatant.unit.idNum, label: ((hero) => hero ? (`${hero.name.value}: ${hero.epithet.value}`) : ("..."))(allHeroes.find(hero => hero.idNum === currentCombatant.unit.idNum)) }}
            onChange={(choice) => { mergeChanges("idNum", +choice!.value) }}
            options={
                allHeroes.map(hero => ({ value: hero.idNum, label: `${hero.name.value}: ${hero.epithet.value}` }))
            } />
        <Select id="unit-rarity" className="w-18"
            value={{ value: currentCombatant.unit.rarity, label: rarityString(currentCombatant.unit.rarity) }}
            onChange={(choice) => { mergeChanges("rarity", choice!.value) }}
            options={
                getAllEnumEntries(Rarity).map(([key, value]) => ({ value: value, label: rarityString(value) }))
            } />
    </div>
}