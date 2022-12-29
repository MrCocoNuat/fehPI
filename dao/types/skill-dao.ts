import {  HeroDefinition, MovementType, MovementTypeIdBitfield, objForEach, SkillDefinition, WeaponType, WeaponTypeIdBitfield,  } from "../../types/dao-types";
import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { IdIndexed } from "../mixins/id-indexed";
import { KeyIndexed } from "../mixins/key-indexed";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as SkillDefinition;

export class SkillDao extends GithubSourced(typeToken, IdIndexed(typeToken, KeyIndexed(typeToken, Dao<SkillDefinition>))){
    constructor({repoPath, timerLabel} : {repoPath: string, timerLabel: string}){
        super({repoPath, timerLabel});
    }

    protected override toValueType: (json: any) => SkillDefinition = (json) => {
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

    protected override valueTypeConsumer: (skillDefinition: SkillDefinition) => void = (skillDefinition) => {
        this.setById(skillDefinition.idNum, skillDefinition);
        this.setByKey(skillDefinition.idTag, skillDefinition);
    };

    async getByIdNums(idNums: number[]){
        await this.initialization;
        return this.getByIds(idNums);
    }

    // NOTE!! idTags are not unique - e.g. Quick Riposte 3 as a PASSIVE_B and Quick Riposte 3 as a PASSIVE_S share the same idTag.
    async getByIdTags(idTags: string[]){
        await this.initialization;
        return this.getByKeys(idTags);
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
