import { assertIsPassiveSkillDefinition, assertIsWeaponDefinition, AssistDefinition, MovementType, MovementTypeBitfield, ParameterPerStat, PassiveSkillDefinition, RefineType, SkillCategory, SkillDefinition, SpecialDefinition, Stat, WeaponDefinition, WeaponType, WeaponTypeBitfield, } from "./dao-types";
import { Dao } from "../mixins/dao";
import { IdIndexed } from "../mixins/id-indexed";
import { KeyIndexed } from "../mixins/key-indexed";
import { getAllEnumValues } from "enum-for";
import { VercelKvBacked } from "../mixins/vercel-kv-backed";
import { idText } from "typescript";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as SkillDefinition;
const imageTypeToken = null! as PassiveSkillDefinition;

const idKeyTypeToken = 0;
const stringKeyTypeToken = "";

export class SkillDao extends VercelKvBacked(typeToken, IdIndexed(typeToken, KeyIndexed(typeToken, Dao<SkillDefinition>))) {

    constructor({ repoPath, timerLabel }: { repoPath: string, timerLabel: string }) {
        super({ repoPath });
        console.time(timerLabel);
        console.timeEnd(timerLabel);
    }

    private async getData() {
        this.setByIds(Object.values(await this.readHash("SKILL_BY_ID", idKeyTypeToken)));
        this.setByKeys(Object.values(await this.readHash("SKILL_BY_KEY", stringKeyTypeToken)));
    }

    async getByIdNums(idNums: number[], filterCategories?: SkillCategory[] | null) {
        const unknownIds = idNums.filter((x) => { return Object.keys(this.collectionIds).indexOf(x.toString()) < 0 });
        if (unknownIds.length > 0){
            await this.setByIds(Object.values(await this.readKeysOfHash("SKILL_BY_ID", unknownIds.map(id => id.toString()), idKeyTypeToken)))
        }
        const skills = this.getByIds(idNums);
        if (filterCategories) {
            return skills.filter(skill => filterCategories.includes(skill.category));
        }
        return skills;
    }

    // NOTE!! idTags are not unique - e.g. Quick Riposte 3 as a PASSIVE_B and Quick Riposte 3 as a PASSIVE_S share the same idTag.
    async getByIdTags(idTags: string[]) {
        const unknownKeys = idTags.filter((x) => { return Object.keys(this.collectionKeys).indexOf(x) < 0 });
        if (unknownKeys.length > 0){
            await this.setByKeys(Object.values(await this.readKeysOfHash("SKILL_BY_KEY", unknownKeys, stringKeyTypeToken)))
        }
        return this.getByKeys(idTags);
    }

}
