import { fchmod } from "fs";
import { asciify } from "../../api-client/mediawiki/file-title";
import { fudge } from "../../api-client/mediawiki/skill-name-fudger";
import { messageDao } from "../dao-registry";
import { fehWikiReader } from "../remote-data/remote-data";
import { HeroDefinition, Language, SkillCategory, SkillDefinition } from "../types/dao-types";
import { DaoConstructor } from "./dao";

// specifically for getting image urls from mediawiki
export function MediaWikiImage<V extends { imageUrl?: string, nameId: string }, DBase extends DaoConstructor<V>>(typeToken: V, dBase: DBase) {
    return class MediaWikiImageDao extends dBase {

        async populateHeroImageUrls(definitions: HeroDefinition[]) {
            const names = await messageDao.getByMessageKeys(Language.USEN, definitions.map(definition => definition.nameId));
            const epithets = await messageDao.getByMessageKeys(Language.USEN, definitions.map(definition => definition.epithetId));
            // zip these up
            const messageStrings = definitions.map((definition, i) => `${names[i].value} ${epithets[i].value}`);
            // TODO:- support resplendency
            const fileTitles = messageStrings.map(messageString => `File:${asciify(messageString)} Face FC.webp`);
            const imageUrls = await fehWikiReader.queryImageUrls(fileTitles);

            definitions.forEach((definition, i) => definition.imageUrl = imageUrls[i]);
            return definitions;
        }

        async populateSkillImageUrls(definitions: SkillDefinition[]) {
            const messages = await messageDao.getByMessageKeys(Language.USEN, definitions.map(definition => definition.nameId));

            const fileTitles = messages.map(message => message.value).map(name => fudge(name)).map(name => `File:${asciify(name)}.png`);
            const imageUrls = await fehWikiReader.queryImageUrls(fileTitles);

            definitions.forEach((definition, i) => definition.imageUrl = imageUrls[i]);
            return definitions;
        }
    }
}