import { gql, useQuery } from "@apollo/client";
import { createContext, useContext, useState } from "react";
import { statsFor } from "../../engine/stat-calculation"
import { Combatant, MAX_SAFE_DRAGONFLOWERS, Unit } from "../../engine/types";
import { Language, MovementType, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { UnitAndRarityPicker } from "./UnitAndRarityPicker";
import { ensureDragonflowerValidity, LevelMergeDragonflowerPicker } from "./LevelMergeDragonflowerPicker";
import { ensureTraitConsistency as ensureTraitValidity, TraitPicker } from "./TraitPicker";
import { SkillsPicker } from "./SkillsPicker";
import { HERO_FIVE_STAR_SKILLS_FRAG, HERO_MOVEMENT_WEAPON_FRAG } from "../api-fragments";



export const SelectedHeroIdContext = createContext(-1);

export function UnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {
    const [selectedHeroId, updateSelectedHeroId] = useState(combatant.unit.idNum);

    //TODO:- probably should be a useEffect instead
    const stats = statsFor(combatant.unit);

    const mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void = (prop, value) => {
        const copyUnit = { ...combatant.unit, [prop]: value };
        ensureTraitValidity(copyUnit, prop);
        ensureDragonflowerValidity(copyUnit, prop);

        if (prop === "idNum") updateSelectedHeroId(value as number);
        updater({ ...combatant, unit: copyUnit });
    }


    console.log("rerender builder");

    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col"
        // prevent clicking from defocusing
        onClick={(evt) => evt.stopPropagation()}>
        <SelectedHeroIdContext.Provider value={selectedHeroId}>
            <form className="m-2 border-2 border-blue-500" onSubmit={(evt) => { evt.preventDefault(); }}>
                <div className="flex flex-col gap-1">
                    <UnitAndRarityPicker currentCombatant={combatant} mergeChanges={mergeChanges} />

                    <LevelMergeDragonflowerPicker currentCombatant={combatant} mergeChanges={mergeChanges} />

                    <TraitPicker currentCombatant={combatant} mergeChanges={mergeChanges} />

                    <div>{`stats: ${JSON.stringify(stats)}`}</div>

                    {<SkillsPicker currentCombatant={combatant} mergeChanges={mergeChanges} />}
                </div>
            </form>
        </SelectedHeroIdContext.Provider>
    </div>
}


