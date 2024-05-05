import { assertIsPassiveSkillDefinition, assertIsWeaponDefinition, AssistDefinition, MovementType, MovementTypeBitfield, ParameterPerStat, PassiveSkillDefinition, RefineType, SkillCategory, SkillDefinition, SpecialDefinition, Stat, WeaponDefinition, WeaponType, WeaponTypeBitfield, } from "./dao-types";
import { Dao } from "../mixins/dao";
import { WriteOnceIdIndexed } from "../mixins/id-indexed";
import { WriteOnceKeyIndexed } from "../mixins/key-indexed";
import { getAllEnumValues } from "enum-for";
import { VercelKvBacked } from "../mixins/vercel-kv-backed";
import { idText } from "typescript";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as SkillDefinition;
const imageTypeToken = null! as PassiveSkillDefinition;

const idKeyTypeToken = 0;
const stringKeyTypeToken = "";

export class SkillDao extends VercelKvBacked(typeToken, WriteOnceIdIndexed(typeToken, WriteOnceKeyIndexed(typeToken, Dao<SkillDefinition>))) {
    initialization: Promise<void>;

    constructor({ repoPath, timerLabel }: { repoPath: string, timerLabel: string }) {
        super({ repoPath });
        console.time(timerLabel);
         this.initialization = this.getData().then(() => console.timeEnd(timerLabel));
    }

    private async getData() {
        this.setByIds(Object.values(await this.readHash("SKILL_BY_ID", idKeyTypeToken)));
        this.setByKeys(Object.values(await this.readHash("SKILL_BY_KEY", stringKeyTypeToken)));
    }

    async getByIdNums(idNums: number[], filterCategories?: SkillCategory[] | null) {
        await this.initialization;
        const skills = this.getByIds(idNums);
        if (filterCategories) {
            return skills.filter(skill => filterCategories.includes(skill.category));
        }
        return skills;
    }

    // NOTE!! idTags are not unique - e.g. Quick Riposte 3 as a PASSIVE_B and Quick Riposte 3 as a PASSIVE_S share the same idTag.
    async getByIdTags(idTags: string[]) {
        await this.initialization;
        return this.getByKeys(idTags);
    }

    async getAll(filterCategories?: SkillCategory[] | null) {
        await this.initialization;
        const skills = this.getAllIds();
        if (filterCategories) {
            return skills.filter(skill => filterCategories.includes(skill.category));
        }
        return skills;
    }
}
