import { HeroDefinition, objForEach, Series, SeriesIdBitfield } from "../../types/dao-types";
import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { IdIndexed } from "../mixins/id-indexed";


// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as HeroDefinition;

export class HeroDao extends GithubSourced(typeToken, IdIndexed(typeToken, Dao<HeroDefinition>)){
    constructor({repoPath, timerLabel} : {repoPath: string, timerLabel: string}){
        super({repoPath, timerLabel});
    }

    protected override toValueType : (json: any) => HeroDefinition = (json) => {
        return {
            idNum: json.id_num,
            sortValue: json.sort_value,
            
            idTag: json.id_tag,
            nameId: (json.id_tag as string).replace(/^PID/, "MPID"),
            epithetId: (json.id_tag as string).replace(/^PID/, "MPID_HONOR"),
            
            dragonflowers : {maxCount: json.dragonflowers.max_count},
            
            series: json.series,
            origins: toSeriesIdBitfield(json.origins),
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

    protected override valueTypeConsumer: (heroDefinition: HeroDefinition) => void = (heroDefinition) => {
        this.setById(heroDefinition.idNum, heroDefinition);
    };

    async getByIdNums(idNums: number[]){
        await this.initialization;
        return this.getByIds(idNums);
    }
}

function toSeriesIdBitfield(seriesBitvector: number): SeriesIdBitfield {
    const bitfield : any = {};
    objForEach(Series, (name) => {
        const id = Series[name];
        if (!isNaN(id)) bitfield[id] = (seriesBitvector & (1 << id)) > 0;
    });

    return bitfield;
}