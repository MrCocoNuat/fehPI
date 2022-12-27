import path from "path";

import { SkillDefinition } from "../types/dao-types";
import { GitObjectType } from "../types/git-types";
import { fehAssetsJsonReader } from "./remote-repository";

class SkillDao{
    private REPO_PATH = "files/assets/Common/SRPG/Skill";
    
    collection : {[idNum : number] : SkillDefinition};
    initialization: Promise<void>;
    
    constructor(){
        this.collection = {};
        this.initialization = this.initialize();
    }
    
    private async initialize() {
        const timerLabel = "TIME: Skill Definition DAO finished initialization";
        console.time(timerLabel);
        await this.processTree();
        console.timeEnd(timerLabel);
    }
    
    private async processTree() {
        // get all of the files in the tree - these are mostly per-update
        const tree = await fehAssetsJsonReader.queryForTree(this.REPO_PATH);
        const entries = tree.repository.object.entries.filter(entry => entry.type === "blob");

        // for each file, get contents
        for (const entry of entries) {
            await this.processBlob(entry);
        }
    }

    private async processBlob(entry: { name: string; type: GitObjectType; object: { isTruncated: boolean; }; }) {
        const entryPath = path.join(this.REPO_PATH, entry.name);
        let blobJson;

        if ((entry.object.isTruncated)) {
            // need to make an ordinary GET request
            const blobText = await fehAssetsJsonReader.getRawBlob(entryPath);
            blobJson = JSON.parse(blobText) as [any];
        } else {
            const blob = await fehAssetsJsonReader.queryForBlob(entryPath);
            blobJson = JSON.parse(blob.repository.object.text) as [any];
        }

        blobJson.map(this.toSkillDefinition).forEach(skillDefinition => this.collection[skillDefinition.idNum] = skillDefinition);
    }

    private toSkillDefinition(jsonSkill: any) : SkillDefinition {
        return {
            idNum: jsonSkill.id_num,
            sortId: jsonSkill.sort_id,
            idTag: jsonSkill.id_tag,
            nameId: jsonSkill.name_id,
            descId: jsonSkill.desc_id,
            prerequisites: jsonSkill.prerequisites,
            refineBase: jsonSkill.refine_base,
            nextSkill: jsonSkill.next_skill,
            exclusive: jsonSkill.exclusive,
            enemyOnly: jsonSkill.enemy_only,
            arcaneWeapon: jsonSkill.arcane_weapon,
            category: jsonSkill.category,
            wepEquip: jsonSkill.wep_equip, //TODO - unbitmask this here!
            movEquip: jsonSkill.mov_equip
        }
    }

    async getSkillByIdNum(idNum: number){
        await this.initialization; // must be done already
        
        return this.collection[idNum];
    }
}

export default new SkillDao();