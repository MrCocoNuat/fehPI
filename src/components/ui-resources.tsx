import { Language, MovementType, SkillCategory } from "../pages/api/dao/types/dao-types";
import Image from "next/image";


// nextjs static inclusions
import enStrings from "../public/ui-strings/EN.json"
import ptStrings from "../public/ui-strings/PT.json"
import esStrings from "../public/ui-strings/ES.json"
import deStrings from "../public/ui-strings/DE.json"
import frStrings from "../public/ui-strings/FR.json"
import itStrings from "../public/ui-strings/IT.json"
import jaStrings from "../public/ui-strings/JA.json"
import zhStrings from "../public/ui-strings/ZH.json"


const stringsForLanguage = {
    [Language.EUDE]: deStrings,
    [Language.EUEN]: enStrings,
    [Language.EUES]: esStrings,
    [Language.EUFR]: frStrings,
    [Language.EUIT]: itStrings,
    [Language.JPJA]: jaStrings,
    [Language.TWZH]: zhStrings,
    [Language.USEN]: enStrings,
    [Language.USES]: esStrings,
    [Language.USPT]: ptStrings,
} as const;

const DEFAULT_LANGUAGE = Language.USEN;
const NOT_TRANSLATED = "NOT_TRANSLATED";
export function getUiStringResource(language: Language, resouceId: keyof typeof enStrings): string {
    const resource = stringsForLanguage[language][resouceId];
    if (resource === NOT_TRANSLATED) {
        return `**${stringsForLanguage[DEFAULT_LANGUAGE][resouceId]}**`;
    }
    return resource;
}


export function dragonflowerImage(movementType?: MovementType) {
    switch (movementType) {
        case MovementType.INFANTRY:
            return <Image src={"/icons/dragonflower/Dragonflower_I.webp"} alt={"DF-I"} fill={true} />;
        case MovementType.ARMORED:
            return <Image src={"/icons/dragonflower/Dragonflower_A.webp"} alt={"DF-A"} fill={true} />;
        case MovementType.FLYING:
            return <Image src={"/icons/dragonflower/Dragonflower_F.webp"} alt={"DF-F"} fill={true} />;
        case MovementType.CAVALRY:
            return <Image src={"/icons/dragonflower/Dragonflower_C.webp"} alt={"DF-C"} fill={true} />;
        default:
            return null;
    }
}

export function ascendantFloretImage() {
    return <Image src={"/icons/misc/Icon_FlowerBud_L.webp"} alt={""} fill={true} />
}

const PassiveSkillCategoryLetter = {
    [SkillCategory.PASSIVE_A]: <div className="text-xs text-red-500 relative bottom-0 right-0">A</div>,
    [SkillCategory.PASSIVE_B]: <div className="text-xs text-green-500 relative bottom-0 right-0">B</div>,
    [SkillCategory.PASSIVE_C]: <div className="text-xs text-blue-500 relative bottom-0 right-0">C</div>,
    [SkillCategory.PASSIVE_S]: <div className="text-xs text-yellow-500 relative bottom-0 right-0">S</div>,
} as const;
export function skillCategoryIcon(skillCategory: SkillCategory, imageUrl?: string) {
    switch (skillCategory) {
        case SkillCategory.WEAPON:
            return <Image src={"/icons/skill-category/FEH_Skill_Offense.webp"} alt={"Weapon"} fill={true} />
        case SkillCategory.ASSIST:
            return <Image src={"/icons/skill-category/FEH_Skill_Assist.webp"} alt={"Assist"} fill={true} />
        case SkillCategory.SPECIAL:
            return <Image src={"/icons/skill-category/FEH_Skill_Special.webp"} alt={"Special"} fill={true} />

        case SkillCategory.PASSIVE_A:
        case SkillCategory.PASSIVE_B:
        case SkillCategory.PASSIVE_C:
        case SkillCategory.PASSIVE_S:
            return <div className="relative">
                {PassiveSkillCategoryLetter[skillCategory]}
                <Image src={imageUrl ?? "/icons/misc/Null_Skill.webp"} alt={"Passive"} fill={true} />
            </div >
        default:
            return <></>;
    }
}