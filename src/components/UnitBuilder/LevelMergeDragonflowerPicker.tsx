import { gql, LazyQueryExecFunction, useLazyQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import { constrainNumeric, MAX_LEVEL, MAX_MERGES, MIN_DRAGONFLOWERS, MIN_LEVEL, MIN_MERGES, Unit } from "../../engine/types";
import { MovementType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { HERO_MAX_DRAGONFLOWERS, HERO_MAX_DRAGONFLOWERS_FRAG, HERO_MOVEMENT_WEAPON, HERO_MOVEMENT_WEAPON_FRAG, INCLUDE_FRAG } from "../api-fragments";
import { AsyncNumericInput } from "../tailwind-styled/async/AsyncNumericInput";
import { NumericInput } from "../tailwind-styled/sync/NumericInput";

import { dragonflowerImage, getUiStringResource } from "../ui-resources";
import { MultiplePropMerger, SelectedHeroIdContext, someSingleProp } from "./UnitBuilder";

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
        currentUnit,
        mergeChanges,
    }: {
        currentUnit: Unit,
        mergeChanges: MultiplePropMerger,
    }
) {
    console.info("rerender lmdf")
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
                value={currentUnit.level}
                onChange={(evt) => mergeChanges(someSingleProp({ prop: "level", value: constrainNumeric(+evt.target.value, MIN_LEVEL, MAX_LEVEL) }))} />
            <label htmlFor="unit-merges">+</label>
            <NumericInput className="w-16" id="unit-merges"
                minMax={{ min: MIN_MERGES, max: MAX_MERGES }}
                value={currentUnit.merges}
                onChange={(evt) => mergeChanges(someSingleProp({ prop: "merges", value: constrainNumeric(+evt.target.value, MIN_MERGES, MAX_MERGES) }))} />
        </div>
        <div className="flex">
            <label htmlFor="unit-dragonflowers" className="flex items-center">
                <div className="relative w-8 aspect-square">
                    {dragonflowerImage(currentHeroMovementType)}
                </div>
                <div>
                    {getUiStringResource(selectedLanguage, "UNIT_DRAGONFLOWERS")}
                </div>
            </label>
            <AsyncNumericInput className="w-16" id="unit-dragonflowers"
                loadMinMax={dragonflowerMinMaxLoader}
                value={currentUnit.dragonflowers}
                // technically not constrained - but this is async so...
                onChange={(evt) => mergeChanges(someSingleProp({ prop: "dragonflowers", value: +evt.target.value }))} />
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