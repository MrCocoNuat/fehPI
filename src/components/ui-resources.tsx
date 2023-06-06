import { BlessingEffect, BlessingSeason, Language, MovementType, RefineType, Series, SkillCategory, WeaponType } from "../pages/api/dao/types/dao-types";
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
            return <></>;
    }
}

export function ascendantFloretImage() {
    return <Image src={"/icons/misc/Icon_FlowerBud_L.webp"} alt={""} fill={true} />
}

export function divineDewImage() {
    return <Image src={"/icons/misc/Divine_Dew.webp"} alt={""} fill={true} />
}

export function resplendentIcon() {
    return <Image src={"/icons/misc/Icon_GodWear.webp"} alt={""} fill={true} />
}

export function orbImage() {
    return <Image src={"/icons/misc/Orb.webp"} alt={""} fill={true} />
}

const PassiveSkillCategoryLetter = {
    [SkillCategory.PASSIVE_A]: <div className="text-s font-semibold text-red-500 absolute bottom-[-6px] right-[-3px] z-10">A</div>,
    [SkillCategory.PASSIVE_B]: <div className="text-s font-semibold text-green-500 absolute bottom-[-6px] right-[-3px] z-10">B</div>,
    [SkillCategory.PASSIVE_C]: <div className="text-s font-semibold text-blue-500 absolute bottom-[-6px] right-[-3px] z-10">C</div>,
    [SkillCategory.PASSIVE_S]: <div className="text-s font-semibold text-yellow-500 absolute bottom-[-6px] right-[-3px] z-10">S</div>,
} as const;
export function skillCategoryIcon(skillCategory: SkillCategory, imageUrl?: string, excludePassiveLetter?: boolean) {
    const exclude = excludePassiveLetter ?? false;
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
            return <div className="relative aspect-square z-0">
                {!exclude && PassiveSkillCategoryLetter[skillCategory]}
                <Image src={imageUrl ?? "/icons/misc/None_Skill.webp"} alt={"Passive"} fill={true} />
            </div >
        default:
            return <></>;
    }
}

const LargePassiveSkillCategoryLetter = {
    [SkillCategory.PASSIVE_A]: <div className="text-3xl font-semibold text-red-500 absolute bottom-0 right-0 z-10">A</div>,
    [SkillCategory.PASSIVE_B]: <div className="text-3xl font-semibold text-green-500 absolute bottom-0 right-0 z-10">B</div>,
    [SkillCategory.PASSIVE_C]: <div className="text-3xl font-semibold text-blue-500 absolute bottom-0 right-0 z-10">C</div>,
    [SkillCategory.PASSIVE_S]: <div className="text-3xl font-semibold text-yellow-500 absolute bottom-0 right-0 z-10">S</div>,
} as const;
export function largeSkillCategoryIcon(skillCategory: SkillCategory, imageUrl?: string, excludePassiveLetter?: boolean) {
    const exclude = excludePassiveLetter ?? false;
    switch (skillCategory) {
        case SkillCategory.WEAPON:
        case SkillCategory.ASSIST:
        case SkillCategory.SPECIAL:
            return skillCategoryIcon(skillCategory, imageUrl, excludePassiveLetter);

        case SkillCategory.PASSIVE_A:
        case SkillCategory.PASSIVE_B:
        case SkillCategory.PASSIVE_C:
        case SkillCategory.PASSIVE_S:
            return <div className="relative aspect-square z-0">
                {!exclude && LargePassiveSkillCategoryLetter[skillCategory]}
                {skillCategoryIcon(skillCategory, imageUrl, true)}
            </div >
        default:
            return <></>;
    }
}

export function weaponRefineIcon(refineType: RefineType, imageUrl?: string) {
    switch (refineType) {
        case RefineType.NONE:
            return skillCategoryIcon(SkillCategory.WEAPON); // just a weapon icon
        case RefineType.EFFECT:
            return <Image src={imageUrl!} alt={"EffectR"} fill={true} /> // provide the image url - these are unique
        case RefineType.ATK:
            return <Image src={"/icons/weapon-refine/Attack_Plus_W.webp"} alt={"AtkR"} fill={true} />
        case RefineType.SPD:
            return <Image src={"/icons/weapon-refine/Speed_Plus_W.webp"} alt={"SpdR"} fill={true} />
        case RefineType.DEF:
            return <Image src={"/icons/weapon-refine/Defense_Plus_W.webp"} alt={"DefR"} fill={true} />
        case RefineType.RES:
            return <Image src={"/icons/weapon-refine/Resistance_Plus_W.webp"} alt={"ResR"} fill={true} />
        case RefineType.WRATHFUL:
            return <Image src={"/icons/weapon-refine/Wrathful_Staff_W.webp"} alt={"WrathfulR"} fill={true} />
        case RefineType.DAZZLING:
            return <Image src={"/icons/weapon-refine/Dazzling_Staff_W.webp"} alt={"DazzlingR"} fill={true} />

    }
}


export function conferredBlessingIcon(blessingSeason: BlessingSeason) {
    switch (blessingSeason) {
        case BlessingSeason.FIRE:
            return <Image src={"/icons/blessing-season/Icon_Season_Fire.webp"} alt={"Fire"} fill={true} />;
        case BlessingSeason.WATER:
            return <Image src={"/icons/blessing-season/Icon_Season_Water.webp"} alt={"Water"} fill={true} />;
        case BlessingSeason.WIND:
            return <Image src={"/icons/blessing-season/Icon_Season_Wind.webp"} alt={"Wind"} fill={true} />;
        case BlessingSeason.EARTH:
            return <Image src={"/icons/blessing-season/Icon_Season_Earth.webp"} alt={"Earth"} fill={true} />;
        case BlessingSeason.LIGHT:
            return <Image src={"/icons/blessing-season/Icon_Season_Light.webp"} alt={"Light"} fill={true} />;
        case BlessingSeason.DARK:
            return <Image src={"/icons/blessing-season/Icon_Season_Dark.webp"} alt={"Dark"} fill={true} />;
        case BlessingSeason.ANIMA:
            return <Image src={"/icons/blessing-season/Icon_Season_Anima.webp"} alt={"Anima"} fill={true} />;
        case BlessingSeason.ASTRA:
            return <Image src={"/icons/blessing-season/Icon_Season_Astra.webp"} alt={"Astra"} fill={true} />;
    }
}

const EXTRA_SLOT_BLESSING_EFFECTS = [
    BlessingEffect.ATK_EXTRA,
    BlessingEffect.SPD_EXTRA,
    BlessingEffect.DEF_EXTRA,
    BlessingEffect.RES_EXTRA,
] as readonly BlessingEffect[];

function innateBlessingSeasonIcon(blessingSeason: BlessingSeason, blessingEffect: BlessingEffect) {
    switch (blessingSeason) {
        case BlessingSeason.FIRE:
            return <Image src={"/icons/blessing-season/Legendary_Effect_Fire.webp"} alt={"Fire"} fill={true} />;
        case BlessingSeason.WATER:
            return <Image src={"/icons/blessing-season/Legendary_Effect_Water.webp"} alt={"Water"} fill={true} />;
        case BlessingSeason.WIND:
            return <Image src={"/icons/blessing-season/Legendary_Effect_Wind.webp"} alt={"Wind"} fill={true} />;
        case BlessingSeason.EARTH:
            return <Image src={"/icons/blessing-season/Legendary_Effect_Earth.webp"} alt={"Earth"} fill={true} />;

        // mythic extra-slots have a different icon
        case BlessingSeason.LIGHT:
            return EXTRA_SLOT_BLESSING_EFFECTS.includes(blessingEffect) ?
                <Image src={"/icons/blessing-season/Mythic_Effect_Light_02.webp"} alt={"Light"} fill={true} /> :
                <Image src={"/icons/blessing-season/Mythic_Effect_Light.webp"} alt={"Light"} fill={true} />;
        case BlessingSeason.DARK:
            return EXTRA_SLOT_BLESSING_EFFECTS.includes(blessingEffect) ?
                <Image src={"/icons/blessing-season/Mythic_Effect_Dark_02.webp"} alt={"Dark"} fill={true} /> :
                <Image src={"/icons/blessing-season/Mythic_Effect_Dark.webp"} alt={"Dark"} fill={true} />;
        case BlessingSeason.ANIMA:
            return EXTRA_SLOT_BLESSING_EFFECTS.includes(blessingEffect) ?
                <Image src={"/icons/blessing-season/Mythic_Effect_Anima_02.webp"} alt={"Anima"} fill={true} /> :
                <Image src={"/icons/blessing-season/Mythic_Effect_Anima.webp"} alt={"Anima"} fill={true} />;
        case BlessingSeason.ASTRA:
            return EXTRA_SLOT_BLESSING_EFFECTS.includes(blessingEffect) ?
                <Image src={"/icons/blessing-season/Mythic_Effect_Astra_02.webp"} alt={"Astra"} fill={true} /> :
                <Image src={"/icons/blessing-season/Mythic_Effect_Astra.webp"} alt={"Astra"} fill={true} />;
    }
}

function blessingEffectIcon(blessingEffect: BlessingEffect) {
    switch (blessingEffect) {
        case BlessingEffect.ATK:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Atk.webp"} alt={"Atk"} fill={true} />;
        case BlessingEffect.ATK_PAIR_UP:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Atk_Btl.webp"} alt={"AtkPairup"} fill={true} />;
        case BlessingEffect.ATK_EXTRA:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Atk_02.webp"} alt={"AtkExtra"} fill={true} />;
        case BlessingEffect.SPD:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Spd.webp"} alt={"Spd"} fill={true} />;
        case BlessingEffect.SPD_PAIR_UP:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Spd_Btl.webp"} alt={"SpdPairup"} fill={true} />;
        case BlessingEffect.SPD_EXTRA:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Spd_02.webp"} alt={"SpdExtra"} fill={true} />;
        case BlessingEffect.DEF:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Def.webp"} alt={"Def"} fill={true} />;
        case BlessingEffect.DEF_PAIR_UP:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Def_Btl.webp"} alt={"DefPairup"} fill={true} />;
        case BlessingEffect.DEF_EXTRA:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Def_02.webp"} alt={"DefExtra"} fill={true} />;
        case BlessingEffect.RES:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Res.webp"} alt={"Res"} fill={true} />;
        case BlessingEffect.RES_PAIR_UP:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Res_Btl.webp"} alt={"ResPairup"} fill={true} />;
        case BlessingEffect.RES_EXTRA:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Res_02.webp"} alt={"ResExtra"} fill={true} />;
        case BlessingEffect.PAIR_UP:
            return <Image src={"/icons/blessing-effect/Ally_Boost_Btl.webp"} alt={"Pairup"} fill={true} />;
    }
}
// a pair of images, one for the season and one for the effect
export function blessingIcons(blessingSeason: BlessingSeason, blessingEffect: BlessingEffect): [JSX.Element, JSX.Element] {
    return [innateBlessingSeasonIcon(blessingSeason, blessingEffect), blessingEffectIcon(blessingEffect)];
}


export function movementTypeIcon(movementType: MovementType) {
    switch (movementType) {
        case MovementType.ARMORED:
            return <Image src={"/icons/movement-type/Icon_Move_Armored.webp"} alt={"Armored"} fill={true} />;
        case MovementType.CAVALRY:
            return <Image src={"/icons/movement-type/Icon_Move_Cavalry.webp"} alt={"Cavalry"} fill={true} />;
        case MovementType.FLYING:
            return <Image src={"/icons/movement-type/Icon_Move_Flying.webp"} alt={"Flying"} fill={true} />;
        case MovementType.INFANTRY:
            return <Image src={"/icons/movement-type/Icon_Move_Infantry.webp"} alt={"Infantry"} fill={true} />;
    }
}

export function weaponTypeIcon(weaponType: WeaponType) {
    switch (weaponType) {
        case WeaponType.BLUE_BEAST:
            return <Image src={"/icons/weapon-type/Icon_Class_Blue_Beast.webp"} alt={"BLUE_BEAST"} fill={true} />;
        case WeaponType.BLUE_BOW:
            return <Image src={"/icons/weapon-type/Icon_Class_Blue_Bow.webp"} alt={"BLUE_BOW"} fill={true} />;
        case WeaponType.BLUE_BREATH:
            return <Image src={"/icons/weapon-type/Icon_Class_Blue_Breath.webp"} alt={"BLUE_BREATH"} fill={true} />;
        case WeaponType.BLUE_DAGGER:
            return <Image src={"/icons/weapon-type/Icon_Class_Blue_Dagger.webp"} alt={"BLUE_DAGGER"} fill={true} />;
        case WeaponType.LANCE:
            return <Image src={"/icons/weapon-type/Icon_Class_Blue_Lance.webp"} alt={"LANCE"} fill={true} />;
        case WeaponType.BLUE_TOME:
            return <Image src={"/icons/weapon-type/Icon_Class_Blue_Tome.webp"} alt={"BLUE_TOME"} fill={true} />;
        case WeaponType.GREEN_BEAST:
            return <Image src={"/icons/weapon-type/Icon_Class_Green_Beast.webp"} alt={"GREEN_BEAST"} fill={true} />;
        case WeaponType.GREEN_BOW:
            return <Image src={"/icons/weapon-type/Icon_Class_Green_Bow.webp"} alt={"GREEN_BOW"} fill={true} />;
        case WeaponType.GREEN_BREATH:
            return <Image src={"/icons/weapon-type/Icon_Class_Green_Breath.webp"} alt={"GREEN_BREATH"} fill={true} />;
        case WeaponType.GREEN_DAGGER:
            return <Image src={"/icons/weapon-type/Icon_Class_Green_Dagger.webp"} alt={"GREEN_DAGGER"} fill={true} />;
        case WeaponType.AXE:
            return <Image src={"/icons/weapon-type/Icon_Class_Green_Axe.webp"} alt={"AXE"} fill={true} />;
        case WeaponType.GREEN_TOME:
            return <Image src={"/icons/weapon-type/Icon_Class_Green_Tome.webp"} alt={"GREEN_TOME"} fill={true} />;
        case WeaponType.COLORLESS_BEAST:
            return <Image src={"/icons/weapon-type/Icon_Class_Colorless_Beast.webp"} alt={"COLORLESS_BEAST"} fill={true} />;
        case WeaponType.COLORLESS_BOW:
            return <Image src={"/icons/weapon-type/Icon_Class_Colorless_Bow.webp"} alt={"COLORLESS_BOW"} fill={true} />;
        case WeaponType.COLORLESS_BREATH:
            return <Image src={"/icons/weapon-type/Icon_Class_Colorless_Breath.webp"} alt={"COLORLESS_BREATH"} fill={true} />;
        case WeaponType.COLORLESS_DAGGER:
            return <Image src={"/icons/weapon-type/Icon_Class_Colorless_Dagger.webp"} alt={"COLORLESS_DAGGER"} fill={true} />;
        case WeaponType.STAFF:
            return <Image src={"/icons/weapon-type/Icon_Class_Colorless_Staff.webp"} alt={"STAFF"} fill={true} />;
        case WeaponType.COLORLESS_TOME:
            return <Image src={"/icons/weapon-type/Icon_Class_Colorless_Tome.webp"} alt={"COLORLESS_TOME"} fill={true} />;
        case WeaponType.RED_BEAST:
            return <Image src={"/icons/weapon-type/Icon_Class_Red_Beast.webp"} alt={"RED_BEAST"} fill={true} />;
        case WeaponType.RED_BOW:
            return <Image src={"/icons/weapon-type/Icon_Class_Red_Bow.webp"} alt={"RED_BOW"} fill={true} />;
        case WeaponType.RED_BREATH:
            return <Image src={"/icons/weapon-type/Icon_Class_Red_Breath.webp"} alt={"RED_BREATH"} fill={true} />;
        case WeaponType.RED_DAGGER:
            return <Image src={"/icons/weapon-type/Icon_Class_Red_Dagger.webp"} alt={"RED_DAGGER"} fill={true} />;
        case WeaponType.SWORD:
            return <Image src={"/icons/weapon-type/Icon_Class_Red_Sword.webp"} alt={"SWORD"} fill={true} />;
        case WeaponType.RED_TOME:
            return <Image src={"/icons/weapon-type/Icon_Class_Red_Tome.webp"} alt={"RED_TOME"} fill={true} />;
    }
}


const stringsForSeries = {
    [Series.SHADOW_DRAGON_AND_NEW_MYSTERY]: "SERIES_ARCHANEA",
    [Series.ECHOES]: "SERIES_VALENTIA",
    [Series.GENEALOGY_OF_THE_HOLY_WAR]: "SERIES_JUGDRAL",
    [Series.THRACIA_776]: "SERIES_THRACIA",
    [Series.BINDING_BLADE]: "SERIES_ELIBE_1",
    [Series.BLAZING_BLADE]: "SERIES_ELIBE_2",
    [Series.SACRED_STONES]: "SERIES_MAGVEL",
    [Series.PATH_OF_RADIANCE]: "SERIES_TELLIUS_1",
    [Series.RADIANT_DAWN]: "SERIES_TELLIUS_2",
    [Series.AWAKENING]: "SERIES_AWAKENING",
    [Series.FATES]: "SERIES_FATES",
    [Series.THREE_HOUSES]: "SERIES_FODLAN",
    [Series.ENGAGE]: "SERIES_ELYOS",
    [Series.HEROES]: "SERIES_ZENITH",
    [Series.TOKYO_MIRAGE_SESSIONS]: "SERIES_TOKYO"
} as const;
export function getUiStringResourceForSeries(language: Language, series: Series){
    return getUiStringResource(language, stringsForSeries[series]);
}