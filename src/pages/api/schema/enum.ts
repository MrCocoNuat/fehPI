import { MovementType, OptionalLanguage, Series, SkillCategory, WeaponType } from "../../../dao/types/dao-types";
import { builder } from "./schema-builder";

export const SkillCategoryEnum = builder.enumType(SkillCategory, {name: "SkillCategory"});
export const MovementTypeEnum = builder.enumType(MovementType, {name: "MovementType"});
export const WeaponTypeEnum = builder.enumType(WeaponType, {name: "WeaponType"});
export const SeriesEnum = builder.enumType(Series, {name: "Series"});
export const LanguageEnum = builder.enumType(OptionalLanguage, {name: "Language"});