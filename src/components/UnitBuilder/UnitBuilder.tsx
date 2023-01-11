import { useQuery } from "@apollo/client";
import { useContext } from "react";
import { statsFor } from "../../engine/stat-calculation"
import { Combatant, constrainNumeric, MAX_LEVEL, MAX_MERGES, MAX_RARITY, MAX_SAFE_DRAGONFLOWERS, MIN_DRAGONFLOWERS, MIN_LEVEL, MIN_MERGES, MIN_RARITY, Unit } from "../../engine/types";
import { Language, MovementType, OptionalStat } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { GET_ALL_HERO_NAMES, GET_SINGLE_HERO } from "../api";
import { getAllEnumValues } from "enum-for";
import { UnitAndRarityPicker } from "./UnitAndRarityPicker";
import { constrainNumericPropWhenMaxDragonflowersIs, ensureDragonflowerConsistency, LevelAndMergesPicker } from "./LevelAndMergesPicker";
import { ensureTraitConsistency, TraitPicker } from "./TraitPicker";





export function UnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {
    const selectedLanguage = useContext(LanguageContext);

    // call API a couple of times
    const { data: heroesData, loading: heroesLoading, error: heroesError } = useQuery(GET_ALL_HERO_NAMES, {
        variables: {
            lang: Language[selectedLanguage],
        }
    });
    // in particular, we need max dragonflowers for the unit
    const { data: unitData, loading: unitLoading, error: unitError } = useQuery(GET_SINGLE_HERO, {
        variables: {
            idNum: combatant.unit.idNum,
        }
    })

    // use API data to hydrate interface
    let allHeroes: { idNum: number, name: { value: string }, epithet: { value: string } }[] = [];
    let selectedHeroMaxDragonflowers: number;
    let selectedHeroMovementType: MovementType | null;
    if (!(heroesLoading || unitLoading)) {
        allHeroes = heroesData.heroes;
        const selectedHero = unitData.heroes[0];
        selectedHeroMaxDragonflowers = selectedHero.maxDragonflowers;
        selectedHeroMovementType = MovementType[selectedHero.movementType as keyof typeof MovementType];
    } else {
        // Still render a dehydrated view
        if (heroesError) console.error(heroesError);
        selectedHeroMaxDragonflowers = MAX_SAFE_DRAGONFLOWERS;
        selectedHeroMovementType = null;
    }
    
    //TODO:- probably should be a useEffect instead
    const stats = statsFor(combatant.unit);
    
    const constrainNumericProp = constrainNumericPropWhenMaxDragonflowersIs(selectedHeroMaxDragonflowers);
    const mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void = (prop, rawValue) => {
        const value = constrainNumericProp(prop, rawValue);
        const copyUnit = { ...combatant.unit, [prop]: value };
        ensureTraitConsistency(copyUnit, prop);
        ensureDragonflowerConsistency(copyUnit, prop);

        updater({ ...combatant, unit: copyUnit });
    }

    console.log("rerender");

    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col" onClick={(evt) => evt.stopPropagation()}>
        <div className="flex">
            {/*<UnitPortrait unit={combatant}></UnitPortrait>  there is already a portrait in the team section! */}
            <div>
                <form className="m-2 border-2 border-blue-500" onSubmit={(evt) => { evt.preventDefault(); }}>
                    <div className="flex flex-col gap-1">
                        <UnitAndRarityPicker currentCombatant={combatant} mergeChanges={mergeChanges} allHeroes={allHeroes} />

                        <LevelAndMergesPicker currentCombatant={combatant} mergeChanges={mergeChanges}
                            selectedHeroProps={{ maxDragonflowers: selectedHeroMaxDragonflowers, movementType: selectedHeroMovementType }} />

                        <TraitPicker currentCombatant={combatant} mergeChanges={mergeChanges} />

                        <div>

                        </div>
                    </div>
                </form>
                <div>{`stats: ${JSON.stringify(stats)}`}</div>
            </div>
        </div>
    </div>
}


