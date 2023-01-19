// already blessed (legend/mythic) heroes cannot receive blessings

import { gql, useLazyQuery } from "@apollo/client";
import { getAllEnumValues } from "enum-for";
import { useContext, useEffect, useState } from "react";
import { SingleValue } from "react-select";
import { NONE_BLESSING, Unit } from "../../engine/types";
import { BlessingEffect, BlessingSeason, HonorType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { HERO_HONOR_BLESSING, HERO_HONOR_BLESSING_FRAG, INCLUDE_FRAG } from "../api-fragments";
import { Select, ValueAndLabel } from "../tailwind-styled/sync/Select";
import { conferredBlessingIcon, getUiStringResource } from "../ui-resources";
import { MultiplePropMerger, SelectedHeroIdContext, someSingleProp } from "./UnitBuilder";

// Query 
// ---------

const GET_HERO_HONOR_BLESSING = gql`
    ${HERO_HONOR_BLESSING_FRAG}
    query getHeroHonorBlessing($heroId: Int!){
        heroes(idNums: [$heroId]){
            idNum
            ${INCLUDE_FRAG(HERO_HONOR_BLESSING)}
        }
    }
`

type HeroHonorBlessing = {
    idNum: number,
    honorType: HonorType,
    blessingEffect?: BlessingEffect,
    blessingSeason?: BlessingSeason,
}

const mapQuery = (json: any) => json.data.heroes.map((queriedHero: any) => ({
    ...queriedHero,
    honorType: HonorType[queriedHero.honorType],
    blessingEffect: (queriedHero.blessingEffect === undefined) ? undefined : BlessingEffect[queriedHero.blessingEffect],
    BlessingSeason: (queriedHero.blessingSeason === undefined) ? undefined : BlessingSeason[queriedHero.blessingSeason]
}))[0] as HeroHonorBlessing;


// Helper
// ----------

const alreadyBlessed = (selectedHeroDetails: HeroHonorBlessing) =>
    (selectedHeroDetails.honorType === HonorType.LEGENDARY || selectedHeroDetails.honorType === HonorType.MYTHIC);


const blessingStringResourceIds = {
    [NONE_BLESSING]: "BLESSING_NONE",
    [BlessingSeason.FIRE]: "BLESSING_FIRE",
    [BlessingSeason.WATER]: "BLESSING_WATER",
    [BlessingSeason.WIND]: "BLESSING_WIND",
    [BlessingSeason.EARTH]: "BLESSING_EARTH",
    [BlessingSeason.LIGHT]: "BLESSING_LIGHT",
    [BlessingSeason.DARK]: "BLESSING_DARK",
    [BlessingSeason.ASTRA]: "BLESSING_ASTRA",
    [BlessingSeason.ANIMA]: "BLESSING_ANIMA",
} as const;


// Component
// ----------

export function BlessingPicker({
    currentUnit,
    mergeChanges,
}: {
    currentUnit: Unit,
    mergeChanges: MultiplePropMerger,
}) {
    const selectedLanguage = useContext(LanguageContext);
    const selectedHeroId = useContext(SelectedHeroIdContext);

    const [heroQuery] = useLazyQuery(GET_HERO_HONOR_BLESSING, {
        variables: {
            heroId: selectedHeroId,
        }
    })

    const [selectedHeroDetails, setSelectedHeroDetails] = useState({
        idNum: selectedHeroId,
        honorType: HonorType.NONE,
    } as HeroHonorBlessing);
    useEffect(() => {
        const updater = async () => {
            const queryResults = mapQuery(await heroQuery());
            setSelectedHeroDetails(queryResults);
        };
        updater();
    }, [selectedHeroId]);

    const NONE_BLESSING_OPTION_ARRAY = [{ value: NONE_BLESSING, label: getUiStringResource(selectedLanguage, blessingStringResourceIds[NONE_BLESSING]) }];

    // render icons, and a selectbox if this hero can change blessings
    return <>
        {alreadyBlessed(selectedHeroDetails) && <div>already blessed</div>}
        {!alreadyBlessed(selectedHeroDetails) && <div className="flex items-center">
            <div className="w-8 aspect-square relative">
                {conferredBlessingIcon(currentUnit.conferredBlessing)}
            </div>
            <Select id={"unit-conferred-blessing"}
                onChange={(choice) => mergeChanges(someSingleProp({ prop: "conferredBlessing", value: +choice!.value }))}
                value={currentUnit.conferredBlessing}
                options={NONE_BLESSING_OPTION_ARRAY
                    .concat(
                        getAllEnumValues(BlessingSeason)
                            .map(blessingSeason => ({ value: blessingSeason, label: getUiStringResource(selectedLanguage, blessingStringResourceIds[blessingSeason]) }))
                    )
                } />
        </div>}
    </>
}