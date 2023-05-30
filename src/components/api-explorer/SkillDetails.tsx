import { SkillQueryResult } from "../../pages/explorer/skill/[skillId]";
import Image from "next/image";
import { getUiStringResource, largeSkillCategoryIcon, movementTypeIcon, skillCategoryIcon, weaponRefineIcon, weaponTypeIcon } from "../ui-resources";
import { SkillCategory } from "../../pages/api/dao/types/dao-types";
import { useContext } from "react";
import { LanguageContext } from "../../pages/_app";

export function SkillDetails({ skillDetails }: { skillDetails: SkillQueryResult }) {
    const selectedLanguage = useContext(LanguageContext);

    const skillId = skillDetails.idNum;

    return <div className="border-2 border-red-500 flex flex-col w-[600px]">
        <div className="flex flex-row justify-center align-center border-2 border-green-500 gap-1">
            <div className="flex flex-col">
                <div className="aspect-square w-24 relative">
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
                <div>
                    {skillDetails.desc.value}
                </div>
            </div>
        </div>
        <div className="border-2 border-dashed border-red-500">

        </div>
    </div>
}