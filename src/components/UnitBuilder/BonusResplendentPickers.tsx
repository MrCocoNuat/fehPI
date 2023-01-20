// the leftovers

import { gql, LazyQueryExecFunction, useLazyQuery } from "@apollo/client";
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { NONE_BLESSING, Unit } from "../../engine/types";
import { LanguageContext } from "../../pages/testpage";
import { HERO_RESPLENDENT, HERO_RESPLENDENT_FRAG, INCLUDE_FRAG } from "../api-fragments";
import { AsyncCheckbox } from "../tailwind-styled/async/AsyncCheckbox";
import { Checkbox } from "../tailwind-styled/sync/Checkbox";
import { getUiStringResource, orbImage, resplendentIcon } from "../ui-resources";
import { MultiplePropMerger, SelectedHeroIdContext, someSingleProp } from "./UnitBuilder";

// blessings
// resplendent
// bonus unit stats

// Query 
// ----------

const GET_HERO_RESPLENDENT = gql`
    ${HERO_RESPLENDENT_FRAG}
    query getHeroResplendent($heroId: Int!){
        heroes(idNums: [$heroId]){
            idNum
            ${INCLUDE_FRAG(HERO_RESPLENDENT)}
        }
    }
`

type HeroBlessingResplendent = {
    idNum: number,
    resplendentExists: boolean
}

const mapQuery = (json: any) => json.data.heroes[0] as HeroBlessingResplendent;

// Loaders
// ----------

async function isDisabledLoader(resplendentQuery: LazyQueryExecFunction<any, any>) {
    const queryResult = mapQuery(await resplendentQuery());
    return !queryResult.resplendentExists;
}

// Component
// ----------

export function BonusResplendentPickers({
    currentUnit,
    mergeChanges,
}: {
    currentUnit: Unit,
    mergeChanges: MultiplePropMerger,
}) {

    const selectedLanguage = useContext(LanguageContext);
    const selectedHeroId = useContext(SelectedHeroIdContext);

    const [resplendentQuery] = useLazyQuery(GET_HERO_RESPLENDENT,
        {
            variables: {
                heroId: selectedHeroId,
            }
        });

    const [disabledLoader, setDisabledLoader] = useState(() => () =>
        isDisabledLoader(resplendentQuery)
    );
    useEffect(() => {
        setDisabledLoader(() => () =>
            isDisabledLoader(resplendentQuery)
        );
    }, [selectedHeroId]);

    return <div className="flex justify-between">
        <div className="flex gap-2">
            <label htmlFor="unit-resplendent" className="flex items-center">
                <div className="w-8 aspect-square relative m-1">
                    {resplendentIcon()}
                </div>
                {getUiStringResource(selectedLanguage, "UNIT_RESPLENDENT")}
            </label>
            {/* <AsyncCheckbox id="unit-resplendent"
                checked={currentUnit.resplendent}
                loadDisabled={disabledLoader}
                onChange={(evt) => mergeChanges({ prop: "resplendent", value: evt.target.checked })} /> */}
            <Checkbox id="unit-resplendent"
                checked={currentUnit.resplendent}
                onChange={(evt) => mergeChanges(someSingleProp({ prop: "resplendent", value: evt.target.checked }))} />
        </div>

        <div className="flex gap-2">
            <label htmlFor="unit-bonus" className="flex items-center">
                <div className="w-8 aspect-square relative m-1">
                    {orbImage()}
                </div>
                {getUiStringResource(selectedLanguage, "UNIT_BONUS")}
            </label>
            <Checkbox id="unit-bonus"
                checked={currentUnit.bonusHero}
                onChange={(evt) => mergeChanges(someSingleProp({ prop: "bonusHero", value: evt.target.checked }))} />
        </div>
    </div>
}

// Exports
// ----------
export function ensureBonusResplendentValidity(unit: Unit, justSetProp: keyof Unit) {
    switch (justSetProp) {
        case "idNum":
            // not all heroes have resplendent outfits
            // we allow them to still get the stat bonus if user wants, but wipe it anyway 
            unit.resplendent = false;
            // same for bonus hero
            unit.bonusHero = false;

    }
}