import { gql, LazyQueryExecFunction, useLazyQuery } from "@apollo/client";
import { Dispatch, SetStateAction, useState } from "react";
import { Combatant, NONE_SKILL_ID, Unit } from "../../engine/types";
import { SkillCategory } from "../../pages/api/dao/types/dao-types";
import { INCLUDE_FRAG, PASSIVE_SKILL_IMAGE_URL, PASSIVE_SKILL_IMAGE_URL_FRAG } from "../api-fragments";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { ValueAndLabel } from "../tailwind-styled/Select";
import { skillCategoryIcon } from "../ui-resources";
import { MultiplePropMerger } from "./UnitBuilder";

// also responsible for rendering skill icons

// where to put no arcane-prf rule?

// Query
// ----------

const GET_SKILL_IMAGE_URL = gql`
    ${PASSIVE_SKILL_IMAGE_URL_FRAG}
    query getSkillImageUrls($id: Int!){
        skills(idNums: [$id]){
            idNum
            ${INCLUDE_FRAG(PASSIVE_SKILL_IMAGE_URL)}
        }
    }
`
type SkillImageUrl = {
    idNum: number,
    imageUrl?: string,
}

const mapQuery = (response: any) => response.data.skills[0] as SkillImageUrl;

// Helper
// ----------

async function applyImageUrlStateSetter(
    skillImageUrlQuery: LazyQueryExecFunction<any, any>,
    setter: Dispatch<SetStateAction<string | undefined>>,
    skillId: number) {
    // skill id 0 for none skill is handled specially
    if (skillId === NONE_SKILL_ID) {
        //console.debug("setter", setter, "called with 0, setting undefined",)
        setter(undefined);
        return;
    }
    //console.debug("setter", setter, "called with", skillId)
    const queryResult = mapQuery(await skillImageUrlQuery({
        variables: {
            id: skillId,
        }
    }));
    //console.debug("setter", setter, "called with", queryResult.imageUrl)
    setter(queryResult.imageUrl);
}

// Component
// ----------

export function PassivesPicker({
    currentUnit,
    mergeChanges,
    skillLoaders,
}: {
    currentUnit: Unit,
    mergeChanges: MultiplePropMerger,
    skillLoaders: { [skillCategory in SkillCategory]: () => Promise<ValueAndLabel<number>[]> }
}) {

    // these states are updated separately
    const [aSkillImageUrl, setASkillImageUrl] = useState(undefined as string | undefined);
    const [bSkillImageUrl, setBSkillImageUrl] = useState(undefined as string | undefined);
    const [cSkillImageUrl, setCSkillImageUrl] = useState(undefined as string | undefined);
    const [sSkillImageUrl, setSSkillImageUrl] = useState(undefined as string | undefined);

    // no variables given here
    /*
    Note: according to https://github.com/apollographql/apollo-client/issues/9755,
    the usage of one useLazyQuery to fire multiple requests simultaneously is not well supported,

    e.g. the A skill and B skill both using the same skillQuery with different args will result in both 
    being resolved as if only one set of arguments (skill id) were passed in,
    and it will return the most recent (B) result (image url) for both !!
    
    This is because useQuery and useLazyQuery are meant to be for a single query - if you call again with new args
    it is expected that you don't care about the previous call anymore and want the newest results.

    Workarounds include using client.query directly (which is the right thing to do, since I do my own lifecycle management,
        and MULTIPLE lifecycle rerenders is starting to get really unneccessarily expensive)
    or calling the hook multiple times, which is what will be done for now because it is easier
    in that case the usecase assumption is correct - 
    If I call the cSkillQuery again, I do not care about the previous C skill request, I care about the newest one.
    */
    //TODO:-MULTIPLEQUERY 
    //const [skillQuery] = useLazyQuery(GET_SKILL_IMAGE_URL);
    const [aSkillQuery] = useLazyQuery(GET_SKILL_IMAGE_URL);
    const [bSkillQuery] = useLazyQuery(GET_SKILL_IMAGE_URL);
    const [cSkillQuery] = useLazyQuery(GET_SKILL_IMAGE_URL);
    const [sSkillQuery] = useLazyQuery(GET_SKILL_IMAGE_URL);

    return <>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_A, aSkillImageUrl)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-a-skill"} className="w-80 flex-1"
                value={currentUnit.passiveASkillId}
                onChange={(choice) => { mergeChanges({prop: "passiveASkillId", value: +choice!.value}); }}
                loadOptions={skillLoaders[SkillCategory.PASSIVE_A]}
                syncValueWithLoadOptions={(value) =>
                    applyImageUrlStateSetter(aSkillQuery, setASkillImageUrl, value!)
                } />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_B, bSkillImageUrl)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-b-skill"} className="w-80 flex-1"
                value={currentUnit.passiveBSkillId}
                onChange={(choice) => { mergeChanges({prop: "passiveBSkillId", value: +choice!.value}); }}
                loadOptions={skillLoaders[SkillCategory.PASSIVE_B]}
                syncValueWithLoadOptions={(value) =>
                    applyImageUrlStateSetter(bSkillQuery, setBSkillImageUrl, value!)
                } />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_C, cSkillImageUrl)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-c-skill"} className="w-80 flex-1"
                value={currentUnit.passiveCSkillId}
                onChange={(choice) => { mergeChanges({prop: "passiveCSkillId", value: +choice!.value}); }}
                loadOptions={skillLoaders[SkillCategory.PASSIVE_C]}
                syncValueWithLoadOptions={(value) =>
                    applyImageUrlStateSetter(cSkillQuery, setCSkillImageUrl, value!)
                } />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_S, sSkillImageUrl)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-s-skill"} className="w-80 flex-1"
                value={currentUnit.passiveSSkillId}
                onChange={(choice) => { mergeChanges({prop: "passiveSSkillId", value: +choice!.value}); }}
                loadOptions={skillLoaders[SkillCategory.PASSIVE_S]}
                syncValueWithLoadOptions={(value) =>
                    applyImageUrlStateSetter(sSkillQuery, setSSkillImageUrl, value!)
                } />
        </div>
    </>
}
