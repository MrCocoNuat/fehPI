import { SkillQueryResult } from "../../pages/explorer/skill/[skillId]";
import Image from "next/image";
import { getUiStringResource, largeSkillCategoryIcon, movementTypeIcon, skillCategoryIcon, weaponRefineIcon, weaponTypeIcon } from "../ui-resources";
import { RefineType, SkillCategory } from "../../pages/api/dao/types/dao-types";
import { useContext } from "react";
import { LanguageContext } from "../../pages/_app";
import Link from "next/link";


export function WeaponDetailsMini(skill: { weaponImageUrl?: string, name: { value: string }, idNum: number, refineType: RefineType }) {
    return <div className="flex flex-row gap-2 items-center bg-blue-500/25  rounded-xl p-1" key={skill.idNum}>
        <div className="aspect-square w-8 relative">
            {weaponRefineIcon(skill.refineType, skill.weaponImageUrl)}
        </div>
        <Link href={`/explorer/skill/${skill.idNum}`} className="flex flex-row gap-2">
            <div>{`${skill.name?.value}`}</div>
            <div className="text-sm">{`(${skill.idNum})`}</div>
        </Link>
    </div>
}

function RefineDetails({ skillDetails }: { skillDetails: SkillQueryResult }) {
    return <div className="flex flex-col items-center">
        {skillDetails.refineBase !== undefined && //TODO: lang
            <div className="bg-blue-500/25  p-2 rounded-xl flex flex-col items-center">
                <div>Refine Base</div>
                {WeaponDetailsMini(skillDetails.refineBase)}
            </div>
        }
        {skillDetails.refines && skillDetails.refines.length > 0 &&  //TODO: lang
            <div className="flex flex-col items-center bg-blue-500/25  p-2 rounded-xl">
                <div className="text-lg">Refines</div>
                {skillDetails.refines.map((refine) => WeaponDetailsMini(refine))}
            </div>
        }
    </div>
}

export function SkillDetailsMini(skill: { imageUrl?: string, name: { value: string }, idNum: number, category: SkillCategory }) {
    return <div className="flex flex-row gap-2 items-center bg-blue-500/25  rounded-xl p-1" key={skill.idNum}>
        <div className="aspect-square w-8 relative">
            {skillCategoryIcon(skill.category, skill.imageUrl)}
        </div>
        <Link href={`/explorer/skill/${skill.idNum}`} className="flex flex-row gap-2">
            <div>{`${skill.name?.value}`}</div>
            <div className="text-sm">{`(${skill.idNum})`}</div>
        </Link>
    </div>
}

function InheritanceChainDetails({ skillDetails }: { skillDetails: SkillQueryResult }) {  //TODO: lang
    return <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-500/25  p-2 rounded-xl flex flex-col items-center">
            <div className="text-lg">Prerequisites</div>
            {skillDetails.prerequisites.map((prereq) => SkillDetailsMini({ ...prereq, category: skillDetails.category }))}
        </div>
        <div className="bg-blue-500/25  p-2 rounded-xl flex flex-col items-center">
            <div className="text-lg">Next</div>
            {skillDetails.nextSkill != undefined && SkillDetailsMini({ ...skillDetails.nextSkill, category: skillDetails.category })}
        </div>
    </div>
}  //TODO: lang

export function SkillDetails({ skillDetails }: { skillDetails: SkillQueryResult }) {
    const selectedLanguage = useContext(LanguageContext);

    return <div className="flex flex-col w-[600px] gap-2">
        <div className="flex flex-row justify-center items-start bg-blue-500/25  rounded-xl p-2 gap-1">
            <div className="flex flex-col items-center">
                <div className="aspect-square w-16 relative">
                    {(skillDetails.refineType !== undefined) ?
                        weaponRefineIcon(skillDetails.refineType, skillDetails.weaponImageUrl)
                        : largeSkillCategoryIcon(skillDetails.category, skillDetails.imageUrl)}
                </div>
                <div className="flex flex-row p-1 bg-blue-500/25  rounded-xl">
                    {skillDetails.movementEquip.map((movementType) =>
                        <div className="relative w-6 aspect-square" key={movementType}>
                            {movementTypeIcon(movementType)}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-4 p-1 bg-blue-500/25  rounded-xl">
                    {skillDetails.weaponEquip.map((weaponType) =>
                        <div className="relative w-6 aspect-square" key={weaponType}>
                            {weaponTypeIcon(weaponType)}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col bg-blue-500/25  rounded-xl p-2">
                <div className="flex flex-row gap-2 items-end">
                    <div className="text-2xl">{`${skillDetails.name.value}`} </div>
                    <div>{`(${skillDetails.idNum})`}</div>
                </div>
                <div className="">{skillDetails.idTag}</div>
                {(skillDetails.exclusive) && <div className=" text-yellow-600 font-bold">{getUiStringResource(selectedLanguage, "SKILL_EXCLUSIVE")}</div>}
                {(skillDetails.enemyOnly) && <div className=" text-red-600 font-bold">{getUiStringResource(selectedLanguage, "SKILL_ENEMY_ONLY")}</div>}
                {(skillDetails.arcaneWeapon) && <div className=" text-purple-600 font-bold">{getUiStringResource(selectedLanguage, "SKILL_ARCANE")}</div>}
                <div>
                    {skillDetails.desc.value != undefined && skillDetails.desc.value}
                </div>
            </div>
        </div>
        {(skillDetails.refineType !== undefined || (skillDetails.prerequisites.length > 0 || skillDetails.nextSkill != undefined)) && <div className="bg-blue-500/25  rounded-xl flex flex-col gap-2 p-2">
            {(skillDetails.refineType !== undefined) &&
                RefineDetails({ skillDetails })}
            {(skillDetails.prerequisites.length > 0 || skillDetails.nextSkill != undefined) &&
                InheritanceChainDetails({ skillDetails })}
        </div>}
    </div>
}