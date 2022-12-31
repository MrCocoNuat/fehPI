import { messageDao } from "../../dao/dao-registry";
import { SkillCategory, SkillDefinition } from "../../dao/types/dao-types";
import { TITLE_SEPARATOR, toFileTitle } from "./file-title";
import { Titleable, WikiDetails } from "./mediawiki-types";

export class MediaWikiHero implements Titleable {
    title: string;
    toTitle() {
        return this.title;
    }
}

export class MediaWikiSkill implements Titleable {
    title: string;
    toTitle(){
        return this.title;
    }   

    const supportedCategories = [
        SkillCategory.PASSIVE_A,
        SkillCategory.PASSIVE_B,
        SkillCategory.PASSIVE_C,
        SkillCategory.PASSIVE_S,
    ]
    constructor(skillDefinition: SkillDefinition){
        const category = skillDefinition.category;
        if (!this.supportedCategories.includes(category)){
            throw new Error(`Mediawiki Unsupported Skill category for ${skillDefinition.idTag}`);
        }
    }
}

export class MediaWikiReader {

    constructor({ baseUrl }: WikiDetails) {
        // mediawiki allows 50 requests in one batch, so do that!

        this.IMAGE_URL_QUERY_FACTORY = (upToFiftyTitles: string[]) => {
            if (upToFiftyTitles.length > 50) {
                throw new Error(`mediawiki max batch size is 50, received ${upToFiftyTitles.length}.`);
            }
            const params = new URLSearchParams({
                action: "query",
                prop: "imageinfo",
                iiprop: "url",
                titles: upToFiftyTitles.join(TITLE_SEPARATOR),
                format: "json",
            })
            return `${baseUrl}?${params.toString()}`;
        }
    }




}