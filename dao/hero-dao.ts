import { HeroDefinition, Series, SeriesBitfield } from "../types/dao-types";
import IdNumIndexedDaoImpl from "./idnum-indexed-dao";
import { getAllEnumValues } from "enum-for";

export class HeroDao extends IdNumIndexedDaoImpl<HeroDefinition>{
    
    protected override toValueType(json: any): HeroDefinition {
        return {
            idNum: json.id_num,
            sortValue: json.sort_value,
            
            idTag: json.id_tag,
            
            dragonflowers : {maxCount: json.dragonflowers.max_count},
            
            series: json.series,
            origins: toSeriesIdBitfield(json.origins),
            weaponType: json.weapon_type,
            movementType: json.move_type,
            refresher: json.refresher,
            
            baseVectorId: json.base_vector_id,
            baseStats: json.base_stats,
            growthRates: json.growth_rates,
            
            // importantly, heroes can equip Skills that are not exclusive OR appear in this collection
            skills: json.skills,
        }
    }
}

function toSeriesIdBitfield(seriesBitvector: number): SeriesBitfield {
    const bitfield : any = {};
    getAllEnumValues(Series).forEach((id) => {
        bitfield[id] = (seriesBitvector & (1 << id)) > 0;
    });
    
    return bitfield;
}
