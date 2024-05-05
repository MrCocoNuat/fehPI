import { Language, Message } from "./dao-types";
import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { WriteOnceKeyIndexed } from "../mixins/key-indexed";
import { VercelKvBacked } from "../mixins/vercel-kv-backed";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as Message;

const keyTypeToken = "";

// There are 10 languages to support right now, each needs its own sub-DAO
class LangMessageDao extends VercelKvBacked(typeToken, GithubSourced(typeToken, WriteOnceKeyIndexed(typeToken, Dao<string>))){
    RELEVANT_KEY_PATTERNS = [
        /^MSID_.*/, // Messages related to Skills
        /^MPID_.*/, // Messages related to Heroes (Persons)
    ] as const;
    initialization: Promise<void>;
    redisKey: string;

    constructor({repoPath, timerLabel, langLabel} : {repoPath: string, timerLabel: string, langLabel: string}){
        super({repoPath});
        this.redisKey = "MESSAGE_BY_KEY_" + langLabel;
        console.time(timerLabel);
        this.initialization = this.getData().then(() => console.timeEnd(timerLabel));
    }
    
    private async getData() {
        this.setByKeys(Object.values(await this.readHash(this.redisKey, keyTypeToken))); //TODO: use the damn setter ya bum
    }
    
    // already correct format
    protected override toValueType = (json : any) => {
        return {
            idTag: json.key,
            value: json.value,
        }
    };

    async getByMessageKeys(messageKeys : string[]){
        await this.initialization;
        return this.getByKeys(messageKeys);
    }
}

export class MessageDao{
    
    private langMessageDaos : {[lang in Language] : LangMessageDao} = {
        0: new LangMessageDao({repoPath: "files/assets/EUDE/Message/", timerLabel: "TIME: EUDE Message DAO finished initialization", langLabel: "EUDE"}),
        1: new LangMessageDao({repoPath: "files/assets/EUEN/Message/", timerLabel: "TIME: EUEN Message DAO finished initialization", langLabel: "EUEN"}),
        2: new LangMessageDao({repoPath: "files/assets/EUES/Message/", timerLabel: "TIME: EUES Message DAO finished initialization", langLabel: "EUES"}),
        3: new LangMessageDao({repoPath: "files/assets/EUFR/Message/", timerLabel: "TIME: EUFR Message DAO finished initialization", langLabel: "EUFR"}),
        4: new LangMessageDao({repoPath: "files/assets/EUIT/Message/", timerLabel: "TIME: EUIT Message DAO finished initialization", langLabel: "EUIT"}),
        5: new LangMessageDao({repoPath: "files/assets/JPJA/Message/", timerLabel: "TIME: JPJA Message DAO finished initialization", langLabel: "JPJA"}),
        6: new LangMessageDao({repoPath: "files/assets/TWZH/Message/", timerLabel: "TIME: TWZH Message DAO finished initialization", langLabel: "TWZH"}),
        7: new LangMessageDao({repoPath: "files/assets/USEN/Message/", timerLabel: "TIME: USEN Message DAO finished initialization", langLabel: "USEN"}),
        8: new LangMessageDao({repoPath: "files/assets/USES/Message/", timerLabel: "TIME: USES Message DAO finished initialization", langLabel: "USES"}),
        9: new LangMessageDao({repoPath: "files/assets/USPT/Message/", timerLabel: "TIME: USPT Message DAO finished initialization", langLabel: "USPT"}),
    }
    
    async getByMessageKeys(lang: Language, messageKeys: string[]){
        const langMessageDao = this.langMessageDaos[lang];
        return langMessageDao.getByMessageKeys(messageKeys);
    }
}
// Absolutely no way of getting around it - the Bootstrapper and the application absolutely MUST be separated
// bootstrapper runs locally only (vercel says so, only 1 project allowed to connect to a KV)
// bootstrapper takes its sweet time, slowly loading up all necessary hashes into linked KV
// this can be reading from local or github (probably local)
// application treats db as Read-Only, and LAZILY queries it - no frickin 4MB requests!!!!
// caching on server is ok - serverless will remain warm for a little bit (minutes?), but recognize that it will be wiped soon for a cold start
//    COUNT how many requests 1 full load requires - Messages in 1 language = 1 * 600 (way too many!!), heroes = 2, skills = 5ish 