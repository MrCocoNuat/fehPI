import { Language } from "../pages/api/dao/types/dao-types";

// nextjs static inclusions
import enStrings from "../public/ui-strings/EN.json"
import ptStrings from "../public/ui-strings/PT.json"
import esStrings from "../public/ui-strings/ES.json"
import deStrings from "../public/ui-strings/DE.json"
import frStrings from "../public/ui-strings/FR.json"
import itStrings from "../public/ui-strings/IT.json"
import jaStrings from "../public/ui-strings/JA.json"
import zhStrings from "../public/ui-strings/ZH.json"


const stringsForLanguage = {
    [Language.EUDE]: deStrings,
    [Language.EUEN]: enStrings,
    [Language.EUES]: esStrings,
    [Language.EUFR]: frStrings,
    [Language.EUIT]: itStrings,
    [Language.JPJA]: jaStrings,
    [Language.TWZH]: zhStrings,
    [Language.USEN]: enStrings,
    [Language.USES]: esStrings,
    [Language.USPT]: ptStrings,
} as const;

const DEFAULT_LANGUAGE = Language.USEN;
const NOT_TRANSLATED = "NOT_TRANSLATED";
export function getUiResources(language: Language, resouceId: keyof typeof enStrings): string | string[] {
    const resource = stringsForLanguage[language][resouceId];
    if (resource === NOT_TRANSLATED){
        return `**${stringsForLanguage[DEFAULT_LANGUAGE][resouceId]}**`;
    }
    return resource;
}