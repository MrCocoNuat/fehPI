import { gql, useQuery } from "@apollo/client";
import { createContext, useContext, useState } from "react";
import { statsFor } from "../../engine/stat-calculation"
import { Combatant, MAX_SAFE_DRAGONFLOWERS, Unit } from "../../engine/types";
import { MovementType, WeaponType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { UnitAndRarityPicker } from "./UnitAndRarityPicker";
import { constrainNumericPropWhenMaxDragonflowersIs, ensureDragonflowerConsistency, LevelAndMergesPicker } from "./LevelAndMergesPicker";
import { ensureTraitConsistency, TraitPicker } from "./TraitPicker";
import { SkillsPicker } from "./SkillsPicker";
import { HERO_FIVE_STAR_SKILLS_FRAG, HERO_MOVEMENT_WEAPON_FRAG } from "../api-fragments";


const GET_SINGLE_HERO = gql`
    ${HERO_FIVE_STAR_SKILLS_FRAG}
    ${HERO_MOVEMENT_WEAPON_FRAG}
    query getHero($id: Int!){
        heroes(ids: [$id]){
            id
            maxDragonflowers
            ...HeroFiveStarSkills
            ...HeroMovementWeapon
        }
    }
`;

type SelectedHeroProps = {
    id: number,
    movementType: MovementType,
    weaponType: WeaponType,
    skills: { known: { id: number, exclusive: boolean }[], learnable: { idNum: number, exclusive: boolean }[] }[],
    maxDragonflowers: number
}


export const SelectedHeroContext = createContext(null as SelectedHeroProps | null);

export function UnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {
    const selectedLanguage = useContext(LanguageContext);
    const [selectedHero, updateSelectedHero] = useState(null as SelectedHeroProps | null);

    // call API a couple of times

    const { data: heroData, loading: heroLoading, error: heroError } = useQuery(GET_SINGLE_HERO, {
        variables: {
            id: combatant.unit.idNum,
        }
    })

    // use API data to hydrate interface
    if (!(heroLoading)) {
        const queriedHero = heroData.heroes[0];
        if (selectedHero === null || queriedHero.id !== selectedHero.id) {
            updateSelectedHero({ ...queriedHero, movementType: MovementType[queriedHero.movementType], weaponType: MovementType[queriedHero.weaponType] });
        }
    } else {
        // Still render a dehydrated view
        if (heroError) console.error(heroError);
    }

    //TODO:- probably should be a useEffect instead
    const stats = statsFor(combatant.unit);

    const constrainNumericProp = constrainNumericPropWhenMaxDragonflowersIs(selectedHero?.maxDragonflowers ?? MAX_SAFE_DRAGONFLOWERS);
    const mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void = (prop, rawValue) => {
        const value = constrainNumericProp(prop, rawValue);
        const copyUnit = { ...combatant.unit, [prop]: value };
        ensureTraitConsistency(copyUnit, prop);
        ensureDragonflowerConsistency(copyUnit, prop);

        updater({ ...combatant, unit: copyUnit });
    }

    console.log("rerender builder");

    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col"
        // prevent clicking from defocusing
        onClick={(evt) => evt.stopPropagation()}>
        <SelectedHeroContext.Provider value={selectedHero}>
            <form className="m-2 border-2 border-blue-500" onSubmit={(evt) => { evt.preventDefault(); }}>
                <div className="flex flex-col gap-1">
                    <UnitAndRarityPicker currentCombatant={combatant} mergeChanges={mergeChanges}/>

                    <LevelAndMergesPicker currentCombatant={combatant} mergeChanges={mergeChanges} />

                    <TraitPicker currentCombatant={combatant} mergeChanges={mergeChanges} />

                    <div>{`stats: ${JSON.stringify(stats)}`}</div>

                   { <SkillsPicker currentCombatant={combatant} mergeChanges={mergeChanges} />}
                </div>
            </form>
        </SelectedHeroContext.Provider>
    </div>
}


