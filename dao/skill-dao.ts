import { SkillDefinition } from "../types/dao-types";
import IdNumIndexedDaoImpl from "./idnum-indexed-dao";

export default class SkillDao extends IdNumIndexedDaoImpl<SkillDefinition> {

    protected override toValueType(json: any) : SkillDefinition {
        return {
            idNum: json.id_num,
            sortId: json.sort_id,
            idTag: json.id_tag,
            nameId: json.name_id,
            descId: json.desc_id,
            prerequisites: json.prerequisites,
            refineBase: json.refine_base,
            nextSkill: json.next_skill,
            exclusive: json.exclusive,
            enemyOnly: json.enemy_only,
            arcaneWeapon: json.arcane_weapon,
            category: json.category,
            wepEquip: json.wep_equip, //TODO - unbitmask this here!
            movEquip: json.mov_equip
        }
    }
}
