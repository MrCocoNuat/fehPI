import { gql, LazyQueryExecFunction, useLazyQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import { Combatant, constrainNumeric, MAX_LEVEL, MAX_MERGES, MAX_RARITY, MAX_SAFE_DRAGONFLOWERS, MIN_DRAGONFLOWERS, MIN_LEVEL, MIN_MERGES, MIN_RARITY, Unit } from "../../engine/types";
import { Language, MovementType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { HERO_MAX_DRAGONFLOWERS, HERO_MAX_DRAGONFLOWERS_FRAG, HERO_MOVEMENT_WEAPON, HERO_MOVEMENT_WEAPON_FRAG, INCLUDE_FRAG } from "../api-fragments";
import { AsyncNumericInput } from "../tailwind-styled/AsyncNumericInput";
import { NumericInput } from "../tailwind-styled/NumericInput";
import { dragonflowerImage, getUiStringResource } from "../ui-resources";
import { SelectedHeroIdContext } from "./UnitBuilder";

// Query
// ----------

// really might as well get both in one query
const GET_MAX_DRAGONFLOWERS_MOVEMENT = gql`
    ${HERO_MAX_DRAGONFLOWERS_FRAG}
    ${HERO_MOVEMENT_WEAPON_FRAG}
    query getExclusiveSkillsMovementWeapon($heroId: Int!){
        heroes(idNums: [$heroId]){
            idNum
            ${INCLUDE_FRAG(HERO_MOVEMENT_WEAPON)}
            ${INCLUDE_FRAG(HERO_MAX_DRAGONFLOWERS)}
        }
    }
`
type HeroMaxDragonflowersMovement = {
    idNum: number,
    maxDragonflowers: number,
    movementType: MovementType,
}

const mapHeroQuery = (response: any) => response.data.heroes.map((responseHero: any) =>
({
    idNum: responseHero.idNum,
    maxDragonflowers: responseHero.maxDragonflowers,
    movementType: MovementType[responseHero.movementType],
}))[0] as HeroMaxDragonflowersMovement;


// Loader
// ----------

const dragonflowerMinMaxLoaderFor = async (
    heroQuery: LazyQueryExecFunction<any, any>,
) => {
    const heroQueryResult = mapHeroQuery(await heroQuery());
    return { min: MIN_DRAGONFLOWERS, max: heroQueryResult.maxDragonflowers };
}

// Component
// ----------

export function LevelMergeDragonflowerPicker(
    {
        currentCombatant,
        mergeChanges,
    }: {
        currentCombatant: Combatant,
        mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    }
) {
    console.log("rerender lmdf")
    const selectedLanguage = useContext(LanguageContext);
    const selectedHeroId = useContext(SelectedHeroIdContext);

    const [heroQuery] = useLazyQuery(GET_MAX_DRAGONFLOWERS_MOVEMENT, {
        variables: {
            heroId: selectedHeroId
        }
    })

    const [dragonflowerMinMaxLoader, setDragonflowerMinMaxLoader] = useState(() => () => {
        return dragonflowerMinMaxLoaderFor(heroQuery);
    });
    const [currentHeroMovementType, setCurrentHeroMovementType] = useState(undefined as MovementType | undefined);
    useEffect(() => {
        console.log("refresh lmdf")
        setDragonflowerMinMaxLoader(() => () => {
            return dragonflowerMinMaxLoaderFor(heroQuery);
        });

        const asyncSetCurrentHeroMovementType = async () => {
            setCurrentHeroMovementType(mapHeroQuery(await heroQuery()).movementType)
        }
        asyncSetCurrentHeroMovementType();
    }, [selectedHeroId]);

    return <div className="flex flex-row justify-between">
        <div>
            <label htmlFor="unit-level">{getUiStringResource(selectedLanguage, "UNIT_LEVEL")}</label>
            <NumericInput className="w-16" id="unit-level"
                minMax={{ min: MIN_LEVEL, max: MAX_LEVEL }}
                value={currentCombatant.unit.level}
                onChange={(evt) => mergeChanges("level", constrainNumeric(+evt.target.value, MIN_LEVEL, MAX_LEVEL))} />
            <label htmlFor="unit-merges">+</label>
            <NumericInput className="w-16" id="unit-merges"
                minMax={{ min: MIN_MERGES, max: MAX_MERGES }}
                value={currentCombatant.unit.merges}
                onChange={(evt) => mergeChanges("merges", constrainNumeric(+evt.target.value, MIN_MERGES, MAX_MERGES))} />
        </div>
        <div className="flex">
            <label htmlFor="unit-dragonflowers">
                <div className="relative w-8 aspect-square">
                    {dragonflowerImage(currentHeroMovementType)}
                </div>
            </label>
            {/* <AsyncNumericInput className="w-16" id="unit-dragonflowers"
                loadMinMax={dragonflowerMinMaxLoader}
                value={currentCombatant.unit.dragonflowers}
                possiblyAsyncOnChange={heroQuery()
                    .then((response) => ((evt) =>
                        mergeChanges("dragonflowers",
                            constrainNumeric(+evt.target.value, MIN_DRAGONFLOWERS, mapHeroQuery(response).maxDragonflowers))))} /> */}
        </div>
    </div>
}


// Exports
// ----------

// the dragonflower count needs to be reset when the hero changes - it might have a lower max dragonflowers
export function ensureDragonflowerValidity(unit: Unit, justSetProp: keyof Unit) {
    switch (justSetProp) {
        case "idNum":
            unit.dragonflowers = MIN_DRAGONFLOWERS;
        default: //do nothing
    }
}