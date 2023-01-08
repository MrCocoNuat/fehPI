import { assertIsWeaponDefinition, MovementType, MovementTypeBitfield, SkillCategory, SkillDefinition, WeaponDefinition, WeaponType, WeaponTypeBitfield, } from "./dao-types";
import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { WriteOnceIdIndexed } from "../mixins/id-indexed";
import { WriteOnceKeyIndexed } from "../mixins/key-indexed";
import { getAllEnumValues } from "enum-for";
import { MediaWikiImage } from "../mixins/mediawiki-image";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as SkillDefinition;

export class SkillDao extends GithubSourced(typeToken, MediaWikiImage(typeToken, WriteOnceIdIndexed(typeToken, WriteOnceKeyIndexed(typeToken, Dao<SkillDefinition>)))) {
    initialization: Promise<void>;

    constructor({ repoPath, timerLabel }: { repoPath: string, timerLabel: string }) {
        super({ repoPath });
        console.time(timerLabel);
        this.initialization = this.loadData().then(() => console.timeEnd(timerLabel));
    }


    private static readonly CATEGORIES_WITH_IMAGES = [
        SkillCategory.PASSIVE_A,
        SkillCategory.PASSIVE_B,
        SkillCategory.PASSIVE_C,
        SkillCategory.PASSIVE_S,
    ]
    private async loadData() {
        return this.getGithubData()
            .then(data => data.filter(definition => definition.idNum > 0)) // remove the NULL Skill
            // must be declared async/await since not returning the promise, but the data
            .then(async data => {
                await this.populateSkillImageUrls(
                    data.filter(skillDefinition => SkillDao.CATEGORIES_WITH_IMAGES.includes(skillDefinition.category))
                );
                return data;
            })
            .then(data => { this.setByIds(data); return data; })
            .then(data => { this.setByKeys(data); return data; })
            .then(data => { this.populateRefines(data); return data; })
    }

    protected override toValueType: (json: any) => SkillDefinition = (json) => {
        const skillDefinition = {
            idNum: json.id_num,
            sortId: json.sort_id,
            idTag: json.id_tag,
            nameId: json.name_id,
            descId: json.desc_id,

            // remove nulls, they are worthless.
            prerequisites: json.prerequisites.filter((idTag: string | null) => idTag !== null),
            nextSkill: json.next_skill,

            exclusive: json.exclusive,
            enemyOnly: json.enemy_only,

            category: json.category,
            wepEquip: toWeaponTypeIdBitfield(json.wep_equip),
            movEquip: toMovementTypeIdBitfield(json.mov_equip),
        }

        // category differentiates SkillDefinition implementations
        switch (skillDefinition.category) {
            case SkillCategory.WEAPON:
                const weaponDefinition: WeaponDefinition = {
                    ...skillDefinition,
                    arcaneWeapon: json.arcane_weapon,
                    refined: json.refined,
                    refineBase: json.refine_base,
                    refineStats: json.refine_stats,
                    // this needs to be loaded in later
                    refines: [],
                };
                return weaponDefinition;
            default:
                return skillDefinition;
        }
    }

    // What about removing stat-refine weapons (that are not staves)?
    //   Almost all inheritable + and all arcane weapons have 4 stat refines, and any prf weapon that has a special effect refine also has 4 stat refines. 
    //   Don't store those pointless SkillDefinitions to save around 11246 - () entries.
    // 
    //   Any stat refined weapon has (refined: true), an hp boost, and a boost to one other stat:
    //
    //   Melee        Ranged
    //   3 5/2,3,4,4  0 2/1,2,3,3    (special:hp hp/atk,spd,def,res)
    //
    //   Special effect refines have only the lower hp boost. Thus stat refines can be distinguished by (refined: true) and a nonzero non-hp boost.
    //
    // There are many exceptions to these rules:
    //   Bravery inheritables do not get refines at all
    //   Melee bravery prfs (with refines) get 5/1,3,4,4 instead
    //   Ranged bravery prfs 
    //   Silver inheritables and inheritables like Wo Dao, Wo Gun get 1 additional atk on all 4 stat refines
    //   Certain prf weapons can "evolve" into other prfs entirely, which themselves may be refinable.
    //   Certain inheritables can "evolve" into other inheritables (but they are inheritable anyway so who cares)
    // This set **IS EXPECTED TO CHANGE** in the future and cannot be handled adequately by the Refine Engine.

    // Only want these categories, 
    RELEVANT_SKILL_CATEGORIES = [
        SkillCategory.WEAPON,
        SkillCategory.ASSIST,
        SkillCategory.SPECIAL,
        SkillCategory.PASSIVE_A,
        SkillCategory.PASSIVE_B,
        SkillCategory.PASSIVE_C,
        SkillCategory.PASSIVE_S
    ] as const;
    protected override acceptIf: (json: any) => boolean = (json) => {
        return this.RELEVANT_SKILL_CATEGORIES.includes(json.category);
    }

    //TODO:- where is a special effect refine's desc stored?

    // the refineBase of a refined weapon points to the unrefined version
    // but a refines of a unrefined weapon pointing to the refined versions is needed too - perform that reverse mapping
    private async populateRefines(data: SkillDefinition[]) {
        data.forEach(skillDefinition => {
            // yes this mutates elements, but it does not structurally modify the list, so it is ok 
            if (!assertIsWeaponDefinition(skillDefinition) || skillDefinition.refineBase === null) {
                return;
            }
            const refineBaseWeapon = this.sneakyGetByKey(skillDefinition.refineBase);
            if (assertIsWeaponDefinition(refineBaseWeapon) /* always true */) {
                refineBaseWeapon.refines.push(skillDefinition.idTag);
            }
        })
    }

    async getByIdNums(idNums: number[]) {
        await this.initialization;
        return this.getByIds(idNums);
    }

    // NOTE!! idTags are not unique - e.g. Quick Riposte 3 as a PASSIVE_B and Quick Riposte 3 as a PASSIVE_S share the same idTag.
    async getByIdTags(idTags: string[]) {
        await this.initialization;
        return this.getByKeys(idTags);
    }

    async getAll() {
        await this.initialization;
        return this.getAllIds();
    }
}


// Is there a nice way to constrain a generic type to Numeric Enum???
function toWeaponTypeIdBitfield(weaponTypeBitvector: number): WeaponTypeBitfield {
    const bitfield: any = {};
    getAllEnumValues(WeaponType).forEach((id) => {
        bitfield[id] = (weaponTypeBitvector & (1 << id)) > 0;
    });

    return bitfield;
}
function toMovementTypeIdBitfield(movementTypeBitvector: number): MovementTypeBitfield {
    const bitfield: any = {};
    getAllEnumValues(MovementType).forEach((id) => {
        bitfield[id] = (movementTypeBitvector & (1 << id)) > 0;
    });

    return bitfield;
}
