import { gql, LazyQueryExecFunction, useLazyQuery } from "@apollo/client";
import { getAllEnumValues } from "enum-for";
import { useCallback, useContext, useEffect, useState } from "react";
import { Combatant, NONE_SKILL_ID, Unit } from "../../engine/types";
import { Language, ParameterPerStat, RefineType, SkillCategory, Stat } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { INCLUDE_FRAG, WEAPON_REFINES, WEAPON_REFINES_FRAG } from "../api-fragments";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { Select, ValueAndLabel } from "../tailwind-styled/Select";
import { skillCategoryIcon, getUiStringResource, divineDewImage } from "../ui-resources";


// weapons need refine handling... and evolutions even though nobody is going to use those



// Query
// ----------

// unrefined weapons only!!
const GET_WEAPON_REFINES = gql`
    ${WEAPON_REFINES_FRAG}
    query getWeaponRefines($id: Int!){
        skills(idNums: [$id]){
            idNum
            ${INCLUDE_FRAG(WEAPON_REFINES)}
        }
    }
`

type WeaponRefines = {
    idNum: number,
    refined: boolean,
    refineType: RefineType,

    refineBase: {
        idNum: number,
        refines: {
            idNum: number,
            refineType: RefineType,
        }[],
    } | null,

    refines: {
        idNum: number,
        refineType: RefineType,
    }[],
}

// uugghh
const mapQuery = (json: any) => json.data.skills.map((queriedWeapon: any) => ({
    ...queriedWeapon,
    // enum keys to values - all three places
    refineType: RefineType[queriedWeapon.refineType],

    refineBase: (queriedWeapon.refineBase === null) ? null : {
        ...queriedWeapon.refineBase,
        refines: queriedWeapon.refineBase.refines.map((queriedRefine: any) => ({
            ...queriedRefine,
            refineType: RefineType[queriedRefine.refineType],
        })),
    },

    refines: queriedWeapon.refines.map((queriedRefine: any) => ({
        ...queriedRefine,
        refineType: RefineType[queriedRefine.refineType],
    })),
}))[0] as WeaponRefines;

// Helper
// ----------

async function getWeaponIds(
    refinesQuery: LazyQueryExecFunction<any, any>,
) {
    const queryResult = mapQuery(await refinesQuery());
    console.log(refinesQuery());
    // id of the NONE-refined weapon
    const refineBaseId = (queryResult.refined) ?
        queryResult.refineBase!.idNum :
        queryResult.idNum;
    const refines = (queryResult.refined) ?
        // grab the refines of the base:
        queryResult.refineBase!.refines :
        // grab the refines directly
        queryResult.refines;

    const result = { [RefineType.NONE]: refineBaseId } as { [refineType in RefineType]: number | undefined };
    refines.forEach(({ idNum, refineType }) => result[refineType] = idNum)
    return result;
}

// Loaders
// ----------

// a bit of a hack since originating query does not request or preserve this information
// refines start at a skill id of:
const LOWEST_REFINED_WEAPON_ID = 0x10000000
// so it is easy to remove all of them
function removeRefinedWeapons(skillLoader: () => Promise<ValueAndLabel<number>[]>) {
    return () => {
        return skillLoader()
            .then(valuesAndLabels =>
                valuesAndLabels.filter(({ value }) => value < LOWEST_REFINED_WEAPON_ID)
            );
    }
}

// Helper
// ----------

const refineStringResourceIds = {
    [RefineType.NONE]: "UNIT_STAT_NONE",
    [RefineType.ATK]: "UNIT_STAT_ATK",
    [RefineType.SPD]: "UNIT_STAT_SPD",
    [RefineType.DEF]: "UNIT_STAT_DEF",
    [RefineType.RES]: "UNIT_STAT_RES",
    [RefineType.EFFECT]: "UNIT_REFINE_EFFECT",
    [RefineType.DAZZLING]: "UNIT_REFINE_DAZZLING",
    [RefineType.WRATHFUL]: "UNIT_REFINE_WRATHFUL",
} as const;
function refineOptions(weaponIds: { [refineType in RefineType]: number | undefined }, language: Language) {
    const options = [] as ValueAndLabel<number>[];
    getAllEnumValues(RefineType).forEach(refineType => {
        const weaponId = weaponIds[refineType]
        if (weaponId !== undefined) {
            options.push({ value: weaponId, label: getUiStringResource(language, refineStringResourceIds[refineType]) });
        }
    });
    return options;
}

// Component
// ----------

export function WeaponPicker({
    currentCombatant,
    mergeChanges,
    skillLoaders,
}: {
    currentCombatant: Combatant,
    mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    skillLoaders: { [skillCategory in SkillCategory]: () => Promise<ValueAndLabel<number>[]> }
}) {
    console.info("rerender weapon picker");

    const selectedLanguage = useContext(LanguageContext);

    const [refinesQuery] = useLazyQuery(GET_WEAPON_REFINES, {
        variables: {
            id: currentCombatant.unit.weaponSkillId,
        }
    })

    // this promise must resolve AFTER the value argument to the AsyncFilterSelect is calculated,
    // otherwise the sync will not happen correctly
    const a = useCallback(
        (/*removeRefinedWeapons*/(skillLoaders[SkillCategory.WEAPON])), [skillLoaders]);

    // the skill ids for each refine option of the currently selected weapon
    // the id with the NONE key is always present (there is always a refine base, even for none weapon 0), others can be undefined
    const NONE_WEAPON_IDS = { [RefineType.NONE]: NONE_SKILL_ID } as { [refineType in RefineType]: number | undefined }
    const [weaponIds, setWeaponIds] = useState(NONE_WEAPON_IDS);
    useEffect(() => {
        const updater = async () => {
            if (currentCombatant.unit.weaponSkillId === NONE_SKILL_ID) {
                setWeaponIds(NONE_WEAPON_IDS);
            } else {
                setWeaponIds(await getWeaponIds(refinesQuery));
            }
        }
        updater();
    },
        // this dependency is a bit too fine - even switching between refines of the same weapon will trigger it
        // however without modifying the base Unit object (e.g. with a weaponSkillBaseId) this is the best that can be done?
        // in any case it is much better than missing required effects.
        [currentCombatant.unit.weaponSkillId]);

    console.debug("arg to AsyncFilterSelect", weaponIds[RefineType.NONE]);
    return <div className="flex gap-2">
        <div className="flex items-center flex-1">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.WEAPON)}
                </div>
            </label>

            <AsyncFilterSelect id={"unit-weapon-skill"} className="min-w-[320px] flex-1"
                value={currentCombatant.unit.weaponSkillId}
                // onChange is OK, it can only change to unrefined weapons
                onChange={(choice) => { console.debug("main selector changed to", choice!.value); mergeChanges("weaponSkillId", +choice!.value); }}
                loadOptions={a} // needs modification for evolutions
                syncValueWithLoadOptions={true} />
        </div>

        <div className="flex items-center">
            <label htmlFor="unit-weapon-refine">
                <div className="flex items-center mx-1">
                    <div className="w-8 aspect-square relative m-1">
                        {divineDewImage()}
                    </div>
                    {getUiStringResource(selectedLanguage, "UNIT_REFINE")}
                </div>
            </label>
            <Select id={"unit-weapon-refine"} className="w-32"
                value={undefined}
                onChange={(choice) => { console.debug("refine selector changed to", choice!.value); mergeChanges("weaponSkillId", +choice!.value); }}
                options={refineOptions(weaponIds, selectedLanguage)} />
        </div>
    </div>
}



// flow:
// receive weapon skill id, skillLoader for weapons containing both refined and unrefined weapons
// .then skillloader to remove all refined weapons (with very high id)
// query for that id
// refined?
// true:
// find refine base id - that is value passed to weapon selector
// find refines OF refine base id - detect refine type from stats - update state - get value/options passed to refine selector
// false:
// pass id directly to weapon selector, pass NONE to refine selector
// find refines - detect refine type from stats - update state - 