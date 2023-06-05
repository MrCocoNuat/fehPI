import { useContext } from "react";
import { LanguageContext } from "../../_app";
import { useRouter } from "next/router";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { MovementType, OptionalLanguage, Series, SeriesName, WeaponType } from "../../api/dao/types/dao-types";
import { SkillQueryResult } from "../skill/[skillId]";
import { HeroDetails } from "../../../components/api-explorer/HeroDetails";

const GET_HERO_DETAIL = gql`
    query getHeroDetail($id: Int!, $language: OptionalLanguage!){
        heroes(idNums:[$id]){
            idNum
            idTag
            movementType
            weaponType
            origins
            refresher
            maxDragonflowers
            name(language: $language){
                value
            }
            epithet(language: $language){
                value
            }
            imageUrl
            honorType
            resplendentExists
            resplendentImageUrl

        }
    }
`

export type HeroQueryResult = {
    idNum: number,
    idTag: string,
    name: {value: string},
    epithet: {value: string},

    imageUrl: string,
    resplendentExists: boolean,
    resplendentImageUrl?: string,

    movementType: MovementType,
    weaponType: WeaponType,
    origins: Series,
    refresher: boolean,

    maxDragonflowers: number,

}

const mapQuery = (data: any) => data.heroes.map((responseHero: any) => ({
    ...responseHero,
    movementType: MovementType[responseHero.movementType],
    weaponType: WeaponType[responseHero.weaponType],
    origins: Series[responseHero.origins],
}))[0] as HeroQueryResult;

export default function SkillExplorer() {
    const currentLanguage = useContext(LanguageContext);
    const router = useRouter();
    const heroId = +(router.query.heroId as String);

    const { loading, error, data } = useQuery(GET_HERO_DETAIL, { variables: { id: heroId, language: OptionalLanguage[currentLanguage] } });

    if (loading) {
        return <>...</>
    }
    if (error) {
        return "error";
    }

    const HeroQueryResult = mapQuery(data);
    return <div className="flex flex-row justify-center border-2 border-purple-600">
        <HeroDetails heroDetails={HeroQueryResult} />
    </div>
}