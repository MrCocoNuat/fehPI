import {  MovementType, MovementTypeIdBitfield, objForEach, SkillDefinition, WeaponType, WeaponTypeIdBitfield,  } from "../types/dao-types";
import IdNumIndexedDaoImpl from "./idnum-indexed-dao";

export class SkillDao extends IdNumIndexedDaoImpl<SkillDefinition> {

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
            wepEquip: toWeaponTypeIdBitfield(json.wep_equip),
            movEquip: toMovementTypeIdBitfield(json.mov_equip),
        }
    }


}

// Is there a nice way to constrain a generic type to Numeric Enum???
function toWeaponTypeIdBitfield(weaponTypeBitvector: number): WeaponTypeIdBitfield {
    const bitfield : any = {};
    objForEach(WeaponType, (name) => {
        const id = WeaponType[name];
        if (!isNaN(id)) bitfield[id] = (weaponTypeBitvector & (1 << id)) > 0;
    });

    return bitfield;
}
function toMovementTypeIdBitfield(movementTypeBitvector: number): MovementTypeIdBitfield {
    const bitfield : any = {};
    objForEach(MovementType, (name) => {
        const id = MovementType[name];
        if (!isNaN(id)) bitfield[id] = (movementTypeBitvector & (1 << id)) > 0;
    });

    return bitfield;
}
