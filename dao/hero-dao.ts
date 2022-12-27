import { HeroDefinition } from "../types/dao-types";
import IdNumIndexedDaoImpl from "./idnum-indexed-dao";

export class HeroDao extends IdNumIndexedDaoImpl<HeroDefinition>{
    
    protected override toValueType(json: any): HeroDefinition {
        return {
            idNum: json.id_num,
            sortValue: json.sort_value,
            
            idTag: json.id_tag,
            
            dragonflowers : {maxCount: json.dragonflowers.max_count},
            
            origins: json.origins, //bitfield
            series: json.series,
            weaponType: json.weapon_type,
            moveType: json.move_type,
            refresher: json.refresher,
            
            baseVectorId: json.base_vector_id,
            baseStats: json.base_stats,
            growthRates: json.growth_rates,
            
            // importantly, heroes can equip Skills that are not exclusive OR appear in this collection
            skills: json.skills,
        }
    }
}