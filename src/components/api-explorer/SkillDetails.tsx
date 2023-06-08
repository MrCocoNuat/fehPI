import { SkillQueryResult } from "../../pages/explorer/skill/[skillId]";
import Image from "next/image";
import { getUiStringResource, largeSkillCategoryIcon, movementTypeIcon, skillCategoryIcon, weaponRefineIcon, weaponTypeIcon } from "../ui-resources";
import { RefineType, SkillCategory } from "../../pages/api/dao/types/dao-types";
import { useContext } from "react";
import { LanguageContext } from "../../pages/_app";
import Link from "next/link";


export function WeaponDetailsMini(skill: { weaponImageUrl?: string, name: { value: string }, idNum: number, refineType: RefineType }) {
    return <div className="flex flex-row gap-2 items-center" key={skill.idNum}>
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
    return <div className="border-2 border-blue-200 flex flex-col items-center">
        {skillDetails.refineBase !== undefined && //TODO: lang
            <div className="border-2 border-blue-200 flex flex-col items-center">
                <div>Refine Base</div>
                {WeaponDetailsMini(skillDetails.refineBase)}
            </div>
        }
        {skillDetails.refines && skillDetails.refines.length > 0 &&  //TODO: lang
            <div className="border-2 border-blue-200 flex flex-col items-center">
                <div>Refines</div>
                {skillDetails.refines.map((refine) => WeaponDetailsMini(refine))}
            </div>
        }
    </div>
}

export function SkillDetailsMini(skill: { imageUrl?: string, name: { value: string }, idNum: number, category: SkillCategory }) {
    return <div className="flex flex-row gap-2 items-center" key={skill.idNum}>
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
    return (skillDetails.prerequisites.length > 0 || skillDetails.nextSkill != undefined) && <div className="grid grid-cols-2">
        <div className="border-2 border-blue-200 flex flex-col items-center">
            <div>Prerequisites</div>
            {skillDetails.prerequisites.map((prereq) => SkillDetailsMini({ ...prereq, category: skillDetails.category }))}
        </div>
        <div className="border-2 border-blue-200 flex flex-col items-center">
            <div>Next</div>
            {skillDetails.nextSkill != undefined && SkillDetailsMini({ ...skillDetails.nextSkill, category: skillDetails.category })}
        </div>
    </div>
}  //TODO: lang

export function SkillDetails({ skillDetails }: { skillDetails: SkillQueryResult }) {
    const selectedLanguage = useContext(LanguageContext);

    return <div className="border-2 border-red-500 flex flex-col w-[600px]">
        <div className="flex flex-row justify-center items-center border-2 border-green-500 gap-1">
            <div className="flex flex-col items-center">
                <div className="aspect-square w-16 relative">
                    {(skillDetails.refineType !== undefined) ?
                        weaponRefineIcon(skillDetails.refineType, skillDetails.weaponImageUrl)
                        : largeSkillCategoryIcon(skillDetails.category, skillDetails.imageUrl)}
                </div>
                <div className="flex flex-row">
                    {skillDetails.movementEquip.map((movementType) =>
                        <div className="relative w-6 aspect-square" key={movementType}>
                            {movementTypeIcon(movementType)}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-4">
                    {skillDetails.weaponEquip.map((weaponType) =>
                        <div className="relative w-6 aspect-square" key={weaponType}>
                            {weaponTypeIcon(weaponType)}
                        </div>
                    )}
                </div>
            </div>
            <div className="border-2 border-blue-500 flex flex-col">
                <div className="text-2xl">{`${skillDetails.name.value} (${skillDetails.idNum})`}</div>
                <div className="">{skillDetails.idTag}</div>
                {(skillDetails.exclusive) && <div className="border-2 border-yellow-500 text-yellow-600 font-bold">{getUiStringResource(selectedLanguage, "SKILL_EXCLUSIVE")}</div>}
                {(skillDetails.enemyOnly) && <div className="border-2 border-yellow-500 text-red-600 font-bold">{getUiStringResource(selectedLanguage, "SKILL_ENEMY_ONLY")}</div>}
                {(skillDetails.arcaneWeapon) && <div className="border-2 border-yellow-500 text-purple-600 font-bold">{getUiStringResource(selectedLanguage, "SKILL_ARCANE")}</div>}
                <div>
                    {skillDetails.desc.value != undefined && skillDetails.desc.value}
                </div>
            </div>
        </div>
        <div className="border-2 border-dashed border-red-500">
            {(skillDetails.refineType !== undefined) &&
                RefineDetails({ skillDetails })}
            {InheritanceChainDetails({ skillDetails })}
        </div>
    </div>
}