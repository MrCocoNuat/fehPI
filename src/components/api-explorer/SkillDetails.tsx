import { SkillQueryResult } from "../../pages/explorer/skill/[skillId]";
import Image from "next/image";
import { skillCategoryIcon, weaponRefineIcon } from "../ui-resources";
import { SkillCategory } from "../../pages/api/dao/types/dao-types";

export function SkillDetails({ skillDetails }: { skillDetails: SkillQueryResult }) {
    const skillId = skillDetails.idNum;

    return <div className="border-2 border-red-500">
        skill explorer: id {skillId}
        <div className="aspect-square w-8 relative">
            {(skillDetails.refineType !== undefined)? 
                weaponRefineIcon(skillDetails.refineType, skillDetails.weaponImageUrl)
                : skillCategoryIcon(skillDetails.category, skillDetails.imageUrl)}
        </div>
    </div>
}