import { dataloaderGetter } from "@pothos/plugin-dataloader";
import gql from "graphql-tag";
import { useContext, useState } from "react";
import { LanguageContext } from "../_app";
import { useQuery } from "@apollo/client";
import { OptionalLanguage } from "../api/dao/types/dao-types";
import { getUiStringResource } from "../../components/ui-resources";
import { HeroDetailsMini } from "../../components/api-explorer/HeroDetails";


const GET_ALL_SKILL = gql`
    query getAllSkillMini($language: OptionalLanguage!){
        heroes(idNums: null){
            idNum
            name(language: $language){
                value
            }
            epithet(language: $language){
                value
            }
            imageUrl
        }
    }
`

type AllHeroQueryResult = {
    idNum: number,
    name: { value: string },
    epithet: { value: string },
    imageUrl: string
}[];

const mapQuery = (data: any) => data.heroes;





function filterHeroes(heroes: AllHeroQueryResult, filterText: string) {
    if (filterText !== "") {
        heroes = heroes.filter(hero => `${hero.name.value}: ${hero.epithet.value} (${hero.idNum})`.toLowerCase().includes(filterText));
    }
    return heroes;
}


export default function HeroExplorer() {
    const currentLanguage = useContext(LanguageContext);

    const { loading, error, data } = useQuery(GET_ALL_SKILL, { variables: { language: OptionalLanguage[currentLanguage] } });
    const [filterText, setFilterText] = useState("");

    if (loading) {
        return <>...</>
    }
    if (error) {
        return "error";
    }


    const heroQueryResult = filterHeroes(mapQuery(data), filterText);
    return <div className="flex flex-row justify-center border-2 border-green-500">
        <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-center gap-2">
                <input type="text" id="filter-text" placeholder={getUiStringResource(currentLanguage, "SEARCH_PLACEHOLDER_NAME_ID")}
                    onChange={(evt) => {
                        evt.stopPropagation();
                        setFilterText(evt.target.value.toLowerCase());
                    }} />

            </div>
            <div className="w-[1200px] grid grid-cols-4 border-2 border-blue-500">
                {heroQueryResult.map((hero) =>
                    <HeroDetailsMini hero={hero} />
                )}
            </div>
        </div>
    </div>
}