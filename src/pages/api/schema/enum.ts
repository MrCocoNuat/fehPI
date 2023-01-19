import { Rarity } from "../../../engine/types";
import { BlessingEffect, BlessingSeason, HonorType, Language, MovementType, OptionalLanguage, RefineType, Series, SkillCategory, WeaponType } from "../dao/types/dao-types";
import { builder } from "./schema-builder";

export const SkillCategoryEnum = builder.enumType(SkillCategory, { name: "SkillCategory" });
export const MovementTypeEnum = builder.enumType(MovementType, { name: "MovementType" });
export const WeaponTypeEnum = builder.enumType(WeaponType, { name: "WeaponType" });
export const SeriesEnum = builder.enumType(Series, { name: "Series" });
export const LanguageEnum = builder.enumType(Language, { name: "Language" })
export const OptionalLanguageEnum = builder.enumType(OptionalLanguage, { name: "OptionalLanguage" });
export const RarityEnum = builder.enumType(Rarity, { name: "Rarity" });
export const RefineTypeEnum = builder.enumType(RefineType, { name: "RefineType" });
export const HonorTypeEnum = builder.enumType(HonorType, {name: "HonorType"});
export const BlessingSeasonEnum = builder.enumType(BlessingSeason, {name: "BlessingSeason"});
export const BlessingEffectEnum = builder.enumType(BlessingEffect, {name: "BlessingEffect"});